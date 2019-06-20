const proxies = require('./data/proxies');
const request = require('request');
const fs = require('fs');
const util = require('util');
const utils = require('../utils/utils');
const appendFile = util.promisify(fs.appendFile);

async function test(){
    try{
        let result = await utils.mapLimit(proxies,5,doRequest);
        await appendFile(`${__dirname}/data/good_proxies.json`, JSON.stringify(result));
    }catch(e){
        console.error(e);
    }

    process.exit(0);
}

async function req(options){
    return new Promise((resolve,reject)=>{
        let _req = request(options,(e,r,body)=>{
            if(e){
                reject(e);
            }else{
                resolve(body);
            }
        });
        setTimeout(()=>{
            _req.abort();
            reject('time out!');
        },3000);
    })
}

async function doRequest(proxy){
    const options = {
        uri: 'https://www.baidu.com',
        method: 'GET',
        encoding: 'utf8',
        gzip: true,
        //followRedirect:true,
        //followAllRedirects:true,
        timeout:1,
        pool:{
            maxSockets:50,
        },
        proxy:{
            hostname:proxy.ip,
            port:proxy.port,
            protocol:`${proxy.protocol}:`
        },
    };
    console.log('trying proxy:',proxy);
    try{
        let body =  await req(options);
        return proxy;
    }catch(e){
        console.error('proxy CAN`t use',proxy);
    }
}

(async ()=>await test())();