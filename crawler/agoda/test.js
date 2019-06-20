const qs = require('querystring');
const url = require('url');
const urls= '/zh-cn/the-upper-house/hotel/hong-kong-hk.html?checkin=2019-06-22&los=1&adults=2&rooms=1&cid=-1&tag=dce8eb1a-c5c5-9327-d1ac-8ae99ae79015&searchrequestid=7a997946-02b8-4803-bc71-e6bc2356681b&travellerType=1';
let baseUrl = url.parse(urls).pathname;
let urlParams =   qs.parse(url.parse(urls).query);
urlParams.checkin = '2020-20-20';
let dailyHotelUrl = `${baseUrl}?${qs.stringify(urlParams)}`;
console.log(dailyHotelUrl);