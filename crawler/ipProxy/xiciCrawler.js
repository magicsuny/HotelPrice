const pupeteer = require('puppeteer');
const utils = require('../utils/utils');
const model = require('./model');

let browser;

async function init() {
    browser = await pupeteer.launch({
        args: [
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
    page.on('load', async response => {
        try {
            await page.waitForSelector('.odd');
            //await page.waitFor(2000);
            const list = await page.evaluate((response) => {
                let result = [];
                let trList = document.querySelectorAll('.odd');
                for (let tr of trList) {
                    let alltd = tr.children;
                    let data = {
                        ip: alltd[1].innerHTML,
                        port: alltd[2].innerHTML,
                        protocol: alltd[5].innerHTML,
                        isValid:true
                    };
                    result.push(data);
                }
                return Promise.resolve(result);
            });
            await model.Proxy.create(list);
            console.log('ip proxies save ok!');
        } catch (e) {

        }
        console.log('ip proxies save ok!');
    });
    return page;
}

async function fetch() {
    let page = await init();
    for (let type of ['nn', 'nt', 'wn', 'wt']) {
        for (let i = 1; i <= 20; i++) {
            await page.goto(`https://www.xicidaili.com/${type}/${i}`);
            await utils.sleep(5000);
        }
    }
    console.log('done');
    //browser.close();
}

(async () => {
    await fetch();
    Promise.resolve().then(() => {
        browser.close();
        process.exit(0);
    })
})();