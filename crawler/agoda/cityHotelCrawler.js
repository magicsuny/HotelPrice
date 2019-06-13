const request = require('request-promise-native');
const moment = require('moment');
const EventEmitter = require('events');
const model = require('./model');

class Crawler {
    constructor(cityId, checkIn) {
        this._event = new EventEmitter();
        this.cityId = cityId;
        this.checkIn = moment(checkIn);
        this.checkOut = moment(this.checkIn).add(1, 'days');
        this.failedNumber = 0;
    }

    // 构建header
    static _buildHeader() {
        return {
            'origin': 'https://www.agoda.com',
            'accept-encoding': 'gzip, deflate, br',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
            'content-type': 'application/json; charset=UTF-8',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7,zh-TW;q=0.6',
            'accept': 'application/json',
            'authority': 'www.agoda.com',
            'x-requested-with': 'XMLHttpRequest',
            'dnt': '1',
        };
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
            'LengthOfStay': 2,
            'CheckIn': this.checkIn.toISOString(),
            'CheckOut': this.checkOut.toISOString(),
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
            pageNumber: pageNumber,
            CheckIn: this.checkIn.toDate(),
            RequestId: this.requestId,
        });
        await fb.save();
        console.log(`Request FailBack saved: ${this.requestId}`);
    }

    async _saveHotel(resultList) {
        if (!Array.isArray(resultList)) {
            return;
        }
        resultList.forEach(async (hotel) => {
            let res = await model.Hotel.updateOne({HotelId: hotel.HotelID}, {
                HotelId: hotel.HotelID,
                CityId: hotel.CityId,
                CityName: hotel.CityName,
                CountryId: hotel.CountryId,
                CountryName: hotel.CountryName,
                HotelUrl: hotel.HotelUrl,
                ThumbnailUrl: hotel.galleryContainerProps.mainImages[0].imageItemProps.url,
                EnglishHotelName: hotel.EnglishHotelName,
                HotelDisplayName: hotel.HotelDisplayName,
                $push: {
                    Prices: {
                        date: this.checkIn.toDate(),
                        DisplayPrice: hotel.DisplayPrice,
                        CrossOutPrice: hotel.CrossOutPrice,
                        DiscountValue: hotel.DiscountValue ? hotel.DiscountValue : 0
                    }
                }
            }, {upsert: true});
        })
    }

    async doSingleTask(pageSize, pageNumber) {
        this.requestId = `${this.cityId}-${pageSize}-${pageNumber}-${this.checkIn.unix()}`;
        const options = {
            uri: 'https://www.agoda.com/api/zh-cn/Main/GetSearchResultList?cid=-1',
            method: 'POST',
            headers: Crawler._buildHeader(),
            body: this._buildParams(pageSize, pageNumber),
            json: true,
            encoding: 'utf8',
            gzip: true,
        };
        try {
            let body = await request(options);
            this._event.emit('complete', body);
            this.failedNumber = 0;
            console.log(`Request complete: ${this.requestId}`);
            if (body.ResultList && body.ResultList.length > 0) {
                return body.ResultList;
            } else {
                return false;
            }
        } catch (e) {
            console.error(e);
            await this._failBack(pageSize, pageNumber);
            this.failedNumber++;
            this._event.emit('error', e);
            return this.failedNumber <= 10;
        }
    }

    async start() {
        let pageSize = 45;
        let pageNumber = 1;
        let result = true;
        while (result) {
            result = await this.doSingleTask(pageSize, pageNumber);
            await this._saveHotel(result);
            pageNumber++;
        }
    }
}


module.exports = Crawler;