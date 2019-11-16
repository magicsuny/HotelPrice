const model = require('./model');
const fs = require('fs');
const util = require('util');
const utils = require('../utils/utils');
const Agent = require('socks5-http-client/lib/Agent');


async function testProxy() {
    let limit = 1000;
    let skip = 0;
    while (true) {
        let resultList = await model.Proxy.find({isValid:true}).limit(limit);
        await utils.mapLimit(resultList, 300, testRequest);
        if (resultList.length === 0) {
            break;
        }
    }
}


async function testRequest(proxy) {
    const options = {
        uri: 'https://www.agoda.com',
        method: 'GET',
        encoding: 'utf8',
        gzip: true,
        //followRedirect:true,
        //followAllRedirects:true,
        timeout: 5000,
        pool: {
            maxSockets: 50,
        },
    };
    if (proxy.protocol.toLowerCase().startsWith('http')) {
        options.proxy = {
            hostname: proxy.ip,
            port: proxy.port,
            protocol: `${proxy.protocol}:`
        };
    } else {
        options.agentClass = Agent;
        options.agentOptions = {
            socksHost: proxy.ip,
            socksPort: proxy.port
        }
    }
    console.log('trying proxy:', proxy);
    try {
        let body = await utils.request(options);
        await model.Proxy.updateMany({ip:proxy.ip,port:proxy.port},{isValid:true});
        return Promise.resolve(proxy);
    } catch (e) {
        //await model.Proxy.deleteMany({ip: proxy.ip, port: proxy.port});
        await model.Proxy.updateMany({ip:proxy.ip,port:proxy.port},{isValid:false});
        //console.error('proxy CAN`t use', proxy);
    }
}
process.on('uncaughtException', function(err) {
    console.log(err.stack);
    console.log('NOT exit...');
});


(async () => {
    try{
        await testProxy();
    }catch(e){
    }

    Promise.resolve().then(()=>process.exit(0));
})();