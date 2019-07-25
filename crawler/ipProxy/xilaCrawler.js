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
            await page.waitForSelector('tr');
            const list = await page.evaluate(() => {
                let result = [];
                let trList = document.querySelectorAll('tr');
                for (let i=1,tr ;tr=trList[i];i++) {
                    let data = {
                        ip: '',
                        port: '',
                        protocol: '',
                        isValid:true
                    };
                    let alltd = tr.children;
                    let ipPort = alltd[0].innerText.split(':');
                    data.ip = ipPort[0];
                    data.port = ipPort[1];
                    let protocol = alltd[1].innerText;
                    data.protocol = protocol.replace('代理','').split(',').slice(-1)[0];
                    result.push(data);
                }
                return result;
            });
            await model.Proxy.create(list);
        } catch (e) {
            debugger;
        }
        console.log('ip proxies save ok!');
    });
    return  page;
}

async function fetch() {
    let  page = await init();
    await page.goto(`https://www.xicidaili.com`);
    for(let type of ['putong','gaoni','http','https']){
        for (let i = 1; i <= 20; i++) {
            await page.goto(`http://www.xiladaili.com/${type}/${i}`);
            await utils.sleep(5000);
        }
    }
    console.log('done');
    //browser.close();
}

(async () => {
    await fetch();
    Promise.resolve().then(()=>{
        browser.close();
        process.exit(0);
    })
})();