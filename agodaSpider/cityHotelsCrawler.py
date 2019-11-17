from datetime import datetime, timedelta
from urllib.parse import parse_qs
import random
import requests
import asyncio
from model import *
from headers_utils import generate_headers

url = 'https://www.agoda.com/api/zh-cn/Main/GetSearchResultList?cid=-1'


class CityHotelsCrawler(object):
    def __init__(self, cityId, checkIn, proxy, pageSize=45, pageNumber=1):
        self.cityId = cityId
        self.checkIn = checkIn
        self.checkOut = checkIn + timedelta(days=1)
        self.pageSize = pageSize
        self.pageNumber = pageNumber
        self.taskId = f'{cityId}-{self.checkIn.timestamp()}'
        self.proxy = proxy

    def __buildParam(self, pageNumber):
        pn = self.pageNumber
        if pageNumber:
            pn = pageNumber
        return {
            'IsPollDmc': False,
            'SearchType': 1,
            'ObjectID': 0,
            'Filters': {
                'PriceRange': {'IsHavePriceFilterQueryParamter': False, 'Min': 0, 'Max': 0},
                'ProductType': [-1], 'HotelName': ''
            },
            'SelectedColumnTypes': {'ProductType': [-1]},
            'CityId': self.cityId,
            'Latitude': 0,
            'Longitude': 0,
            'Radius': 0,
            'PageNumber': pn,
            'PageSize': self.pageSize,
            'SortOrder': 1,
            'SortField': 0,
            'PointsMaxProgramId': 0,
            'PollTimes': 0,
            'RequestedDataStatus': 0,
            'MaxPollTimes': 4,
            'IsAllowYesterdaySearch': False,
            'CultureInfo': 'zh-CN',
            'CurrencyCode': 'CNY',
            'UnavailableHotelId': 0,
            'IsEnableAPS': False,
            'SelectedHotelId': 0,
            'IsComparisonMode': False,
            'HasFilter': False,
            'LandingParameters': {'SelectedHotelId': 0, 'LandingCityId': self.cityId},
            'NewSSRSearchType': 0,
            'IsWysiwyp': False,
            'MapType': 1,
            'IsShowMobileAppPrice': False,
            'IsApsPeek': False,
            'IsRetina': False,
            'IsCriteriaDatesChanged': False,
            'TotalHotelsFormatted': '992',
            'Cid': -1,
            'ProductType': -1,
            'NumberOfBedrooms': [],
            'ShouldHideSoldOutProperty': False,
            'FamilyMode': False,
            'isAgMse': False,
            'ccallout': False,
            'defdate': False,
            'Adults': 2,
            'Children': 0,
            'Rooms': 1,
            'LengthOfStay': 1,
            'CheckIn': self.checkIn.strftime('%Y-%m-%dT00:00:00'),
            'CheckOut': self.checkOut.strftime('%Y-%m-%d:00:00:00'),
            'ChildAges': [],
            'DefaultChildAge': 8,
            'IsDateless': False,
            'CheckboxType': 0,
            'TravellerType': 1
        }

    def __request(self, pageNumber):
        headers = generate_headers()
        params = self.__buildParam(pageNumber)
        proxies = self.proxy.getProxy()
        print('request  %{s} cityId %{s},%{s}', self.taskId,params['CityId'], params['PageNumber'])
        response = requests.post(url, headers=headers, json=params, proxies=proxies, timeout=5)
        data = response.json()
        try:
            return data
        except:
            print(data)

    def __saveHotel(self, hotel):
        hotel_dict = {
            'Source': 'Agoda',
            'HotelId': hotel['HotelID'],
            'CityId': hotel['CityId'],
            'CityName': hotel['CityName'],
            'CountryId': hotel['CountryId'],
            'CountryName': hotel['CountryName'],
            'HotelUrl': hotel['HotelUrl'],
            'MainPhotoUrl': hotel['MainPhotoUrl'],
            'EnglishHotelName': hotel['EnglishHotelName'],
            'HotelDisplayName': hotel['HotelDisplayName'],
            'Latitude': hotel['Latitude'],
            'Longitude': hotel['Longitude'],
            'Highlights': hotel['Highlights'],
            'ReviewScore': hotel['ReviewScore'],
            'StarRating': hotel['StarRating'],
            f'Prices.{self.checkIn.strftime("%Y-%m-%d")}': {
                'date': self.checkIn,
                'formatDate': self.checkIn.strftime("%Y-%m-%d"),
                'url': hotel['HotelUrl'],
                'DisplayPrice': hotel['DisplayPrice'],
                'CrossOutPrice': hotel['CrossOutPrice'],
                'DiscountValue': hotel['FormattedDiscountValue']
            }
        }
        model.saveHotels(hotel_dict)

    def do(self):
        try:
            data = self.__request(self.pageNumber)
        except Exception as arg:
            print(arg);
            return
        if (len(data) == 0):
            return
        print('request success!')
        totalPage = data['TotalPage']
        hotels = data['ResultList']
        for hotel in hotels:
            self.__saveHotel(hotel)

        for i in range(1, totalPage + 1):
            self.pageNumber = i
        model.updateTask(self.taskId, self.checkIn.timestamp(), self.pageSize, self.pageNumber)
        print(f'taskId: {self.taskId} saved page {self.pageNumber}')
        self.pageNumber += 1
        self.checkIn = self.checkIn + timedelta(days=1)
        model.updateTask(self.taskId, self.checkIn.timestamp(), self.pageSize, self.pageNumber, True)
        while (True):
            try:
                data = self.__request()
            except Exception as arg:
                return
            if (len(data) == 0):
                break
            for hotel in data:
                self.__saveHotel(hotel)
            model.updateTask(self.taskId, self.checkIn.timestamp(), self.pageSize, self.pageNumber)
            print(f'taskId: {self.taskId} saved page {self.pageNumber}')
            self.pageNumber += 1
        self.checkIn = self.checkIn + timedelta(days=1)
        model.updateTask(self.taskId, self.checkIn.timestamp(), self.pageSize, self.pageNumber, True)
        print(f'crawler {self.taskId} is Done')

    def doRequest(self):
        # 第一次请求获取页数
        try:
            data = self.__request(0)
        except Exception as arg:
            print('repr(e):\t', repr(arg))
            print('e.message:\t', arg.message)
            return
        if (len(data) == 0):
            return
        totalPage = data['TotalPage']
        hotels = data['ResultList']

        loop = asyncio.get_event_loop()
        group = asyncio.gather([self.__request(i) for i in range(1, totalPage + 1)])
        results = loop.run_until_complete(group)
        loop.close()
        return results