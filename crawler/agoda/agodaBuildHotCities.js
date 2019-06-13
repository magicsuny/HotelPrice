const pupeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');
const appendFile = util.promisify(fs.appendFile);
(async () => {
    const browser = await pupeteer.launch({
        args:[
            '-disable-gpu',
            '-disable-dev-shm-usage',
            '-disable-setuid-sandbox',
            '-no-first-run',
            '-no-sandbox',
            '-no-zygote',
            '-single-process',
        ]
    });
    const page = await browser.newPage();

    page.on('response', async response => {
        const url = response.request().url();

        if (url.startsWith('https://www.agoda.com/api/zh-cn/hubapi/cities')) {
            let data = await response.json();

            let sections = data.sections;
            let dataList = [];
            sections.forEach(async sec => {
                const areaTitle = sec.hotelLinks.title;
                const pid = sec.hotelLinks.id;
                const list = sec.hotelLinks.list;
                list.forEach(async hotel => {
                    const id = hotel.id;
                    const title = hotel.text;
                    const link = hotel.link;
                    const tempData = {
                        areaTitle: areaTitle,
                        areaId: pid,
                        cityId: id,
                        cityTitle: title,
                        link: link,
                    };
                    //const line = `${title},${pid},${id},${areaTitle},${link}\n`;
                    //
                    dataList.push(tempData);
                    console.log(`${tempData} write ok`);
                });

            });
            await appendFile(`${__dirname}/data/hotcities.json`, JSON.stringify(dataList));
            await browser.close();
            console.log('hot cities save ok!');
            process.exit(0);
        }
    });
    await page.goto('https://www.agoda.com/zh-cn/cities.html?cid=-1&amp;migration=2&amp;option=reset-password&amp;ckuid=d5ce8f19-2bc2-4cfe-b780-066505e1c80c');
    //await browser.close();
})();