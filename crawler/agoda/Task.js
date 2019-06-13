const Crawler = require('./cityHotelCrawler');
const moment = require('moment');
const sourceList = require('./data/hotcities.json');

async function main() {
    let startDate = moment(new Date());
    let endDate = moment(startDate).add(60, 'days');
    for (let i = 0, source; source = sourceList[i]; i++) {
        while (startDate.isSameOrBefore(endDate)) {
            startDate = startDate.add(1, 'days');
            let c = new Crawler(511207, startDate);
            try {
                await c.start();
            } catch (e) {
                console.error(e);
            }
        }
    }
    process.exit(0);
}

(async () => await main())();
