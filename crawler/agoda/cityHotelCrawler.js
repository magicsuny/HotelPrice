const request = require('request');
const moment = require('moment');
const EventEmitter = require('events');
const model = require('./model');
const url = require('url');
const qs = require('querystring');
const utils = require('../utils/utils');
const UserAgent = require('user-agents');
const IpProxyService = require('../ipProxy/IpProxyService');


class Crawler {
    constructor(cityId, checkIn) {
        this._event = new EventEmitter();
        this.cityId = cityId;
        this.checkIn = moment(checkIn).startOf('date');
        this.checkOut = moment(this.checkIn).add(1, 'days');
        this.failedNumber = 0;
    }

    static _generatorAgent(){
        const userAgent = new UserAgent({ deviceCategory: 'tablet' });
        return userAgent.random().toString();
    }
    // 构建header
    static _buildHeader() {
        return {
            'origin': 'https://www.agoda.com',
            'accept-encoding': 'gzip, deflate, br',
            'user-agent': Crawler._generatorAgent(),
            'content-type': 'application/json; charset=UTF-8',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
            'accept': 'application/json',
            'authority': 'www.agoda.com',
            'x-requested-with': 'XMLHttpRequest',
            'host': 'www.agoda.com',
            'dnt': '1',
        };
    }

    /**
     * 随机获取代理
     * @returns {*}
     * @private
     */
    _getRandomProxy(){
        if(this.proxies.length>0){
            let randomIndex =  Math.floor(Math.random()*this.proxies.length);
            let {ip:hostname,port:port,protocol:protocol} = this.proxies[randomIndex];
            return {
                hostname,
                port,
                protocol:`${protocol}:`
            }

        }
    }

    //构建请求参数
    _buildParams(pageSize, pageNumber) {
        return {
            'IsPollDmc': false,
            'SearchType': 1,
            'ObjectID': 0,
            'Filters': {
                'PriceRange': {'IsHavePriceFilterQueryParamter': false, 'Min': 0, 'Max': 0},
                'ProductType': [-1], 'HotelName': ''
            },
            'SelectedColumnTypes': {'ProductType': [-1]},
            'CityId': this.cityId,
            'Latitude': 0,
            'Longitude': 0,
            'Radius': 0,
            'PageNumber': pageNumber,
            'PageSize': pageSize,
            'SortOrder': 1,
            'SortField': 0,
            'PointsMaxProgramId': 0,
            'PollTimes': 0,
            'RequestedDataStatus': 0,
            'MaxPollTimes': 4,
            'IsAllowYesterdaySearch': false,
            'CultureInfo': 'zh-CN',
            'CurrencyCode': 'CNY',
            'UnavailableHotelId': 0,
            'IsEnableAPS': false,
            'SelectedHotelId': 0,
            'IsComparisonMode': false,
            'HasFilter': false,
            'LandingParameters': {'SelectedHotelId': 0, 'LandingCityId': this.cityId},
            'NewSSRSearchType': 0,
            'IsWysiwyp': false,
            'MapType': 1,
            'IsShowMobileAppPrice': false,
            'IsApsPeek': false,
            'IsRetina': false,
            'IsCriteriaDatesChanged': false,
            'TotalHotelsFormatted': '992',
            'Cid': -1,
            'ProductType': -1,
            'NumberOfBedrooms': [],
            'ShouldHideSoldOutProperty': false,
            'FamilyMode': false,
            'isAgMse': false,
            'ccallout': false,
            'defdate': false,
            'Adults': 2,
            'Children': 0,
            'Rooms': 1,
            'LengthOfStay': 1,
            'CheckIn': this.checkIn.format('YYYY-MM-DD'),
            'CheckOut': this.checkOut.format('YYYY-MM-DD'),
            'ChildAges': [],
            'DefaultChildAge': 8,
            'IsDateless': false,
            'CheckboxType': 0,
            'TravellerType': 1
        };
    }

    //事件
    on(eventName, listener) {
        this._event.on(eventName, listener);
    }

    async _failBack(pageSize, pageNumber) {
        let fb = model.FailRequestLogs({
            CityId: this.cityId,
            PageSize: pageSize,
            PageNumber: pageNumber,
            CheckIn: this.checkIn.toDate(),
            RequestId: this.requestId,
        });
        await fb.save();
        console.error(`Request FailBack saved: ${this.requestId}`);
    }

    async _saveHotel(resultList) {
        if (!Array.isArray(resultList)) {
            return;
        }
        await utils.mapLimit(resultList, 10, async (hotel) => {
            let baseUrl = url.parse(hotel.HotelUrl).pathname;
            let urlParams = qs.parse(url.parse(hotel.HotelUrl).query);
            urlParams.checkin = this.checkIn.format('YYYY-MM-DD');
            urlParams.los = 1;
            let dailyHotelUrl = `${baseUrl}?${qs.stringify(urlParams)}`;
            let updateContent = {
                Source: 'Agoda',
                HotelId: hotel.HotelID,
                CityId: hotel.CityId,
                CityName: hotel.CityName,
                CountryId: hotel.CountryId,
                CountryName: hotel.CountryName,
                HotelUrl: hotel.HotelUrl,
                MainPhotoUrl: hotel.MainPhotoUrl,
                EnglishHotelName: hotel.EnglishHotelName,
                HotelDisplayName: hotel.HotelDisplayName,
                Latitude: hotel.Latitude,
                Longitude: hotel.Longitude,
                Highlights: hotel.Highlights,
                [`Prices.${this.checkIn.format('YYYY-MM-DD')}`]: {
                    date: this.checkIn.toDate(),
                    formatDate: this.checkIn.format('YYYY-MM-DD'),
                    url: dailyHotelUrl,
                    DisplayPrice: hotel.DisplayPrice,
                    CrossOutPrice: hotel.CrossOutPrice,
                    DiscountValue: hotel.FormattedDiscountValue ? hotel.FormattedDiscountValue : 10
                }
            };
            let result = await model.Hotel.updateOne({HotelId: hotel.HotelID}, updateContent, {
                upsert: true
            });
            //
        });

    }

    async doSingleTask(pageSize, pageNumber, delay = 0) {
        this.requestId = `${this.cityId}-${pageSize}-${pageNumber}-${this.checkIn.unix()}`;
        const options = {
            uri: 'https://www.agoda.com/api/zh-cn/Main/GetSearchResultList?cid=-1',
            method: 'POST',
            headers: Crawler._buildHeader(),
            body: this._buildParams(pageSize, pageNumber),
            json: true,
            encoding: 'utf8',
            gzip: true,
            //followRedirect:true,
            //followAllRedirects:true,
            // proxy:{
            //     hostname:'183.129.207.89',
            //     port:27794,
            //     protocol:'https:'
            // },
            // tunnel:true,
        };
        options.proxy = this._getRandomProxy();
        if (delay > 0) {
            await utils.sleep(delay);
        }
        try {
            let body = await utils.request(options);
            if (!body||!(body instanceof Object)) {
                await this.retry(pageSize, pageNumber, 5);
            }
            this._event.emit('complete', body);
            this.failedNumber = 0;
            console.log(`Request complete: ${this.requestId}`);
            if (body.ResultList && body.ResultList.length > 0) {
                return body.ResultList;
            } else {
                return [];
            }
        } catch (e) {
            await this.retry(pageSize, pageNumber, 5);
        }
    }

    async retry(pageSize, pageNumber, limit = 5) {
        this.failedNumber++;
        //this._event.emit('error', this);
        if (this.failedNumber <= limit) {
            //retry
            console.error(`Request Error: ${this.requestId} retry ${this.failedNumber} times`);
            await this.doSingleTask(pageSize, pageNumber, this.failedNumber * 1000);
        } else {
            this._event.emit('error', 'request error');
            await this._failBack(pageSize, pageNumber);
        }
    }

    async start() {
        this.proxies = await IpProxyService.getRandom(10);
        let pageSize = 45;
        let pageNumber = 1;
        while (true) {
            let result = await this.doSingleTask(pageSize, pageNumber,Math.floor(Math.random()*500));
            await this._saveHotel(result);
            utils.sleep(1000);
            if (result.length === 0) {
                return Promise.resolve(true);
            }
            pageNumber++;
            console.log(`city ${this.cityId}  ${result.length} hotels saved`);
        }
    }
}


module.exports = Crawler;