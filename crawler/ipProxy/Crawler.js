const pupeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');
const appendFile = util.promisify(fs.appendFile);
(async () => {
    const browser = await pupeteer.launch({
        args:[
            '-disable-gpu',
            //'-disable-dev-shm-usage',
            '-disable-setuid-sandbox',
            '-no-first-run',
            '-no-sandbox',
            '-no-zygote',
            '-single-process',
        ]
    });
    const page = await browser.newPage();

    page.on('load',async response =>{
        const list = await page.evaluate(() => {
            let result = [];
            let trList = document.querySelectorAll('.odd');
            for(let tr of trList){
                let data = {
                    ip:'',
                    port:'',
                    protocol:''
                };
                let alltd = tr.children;
                data.ip = alltd[1].innerHTML;
                data.port = alltd[2].innerHTML;
                data.protocol = alltd[5].innerHTML;
                result.push(data);
            }
            return result;
        });
        await appendFile(`${__dirname}/data/proxies.json`, JSON.stringify(list));
        await browser.close();
        console.log('ip proxies save ok!');
        process.exit(0);
    });
    await page.goto('https://www.xicidaili.com/');
    //await browser.close();
})();