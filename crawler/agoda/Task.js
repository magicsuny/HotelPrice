#!/usr/bin/env node
const Crawler = require('./cityHotelCrawler');
const moment = require('moment');
const sourceList = require('./data/hotcities.json');
const utils = require('../utils/utils');

async function crawByDate(cityId) {
    let startDate = moment(new Date()).add(1, 'days');
    let endDate = moment(startDate).add(3, 'months');
    //for (;startDate.isSameOrBefore(endDate);) {
        let c = new Crawler(cityId, startDate);
        startDate = startDate.add(1, 'days');
        try {
            await c.start();
            await utils.sleep(Math.floor(Math.random() * 800));
        } catch (e) {
            //console.error('发生错误',e);
        }
   // }
    return c;
}

async function main() {
    let start = Date.now();
    let paramList = [];
    // for (let source of sourceList) {
    //     paramList.push(source.cityId);
    // }
    // await utils.mapLimit(paramList, 1, crawByDate);
    await crawByDate(sourceList[0].cityId);
    let end = Date.now();
    console.log(`done during ${end - start} ms`);
    //process.exit(0);
}

(async () => await main())();
