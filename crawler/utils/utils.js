const request = require('request');

exports.request = async function (options) {
    return new Promise((resolve, reject) => {
        let _req = request(options, (e, r, body) => {
            if (e) {
                reject(e);
            } else {
                resolve(body);
            }
        });
        setTimeout(() => {
            _req.abort();
            reject('time out!');
        }, options.timeout||10000);
    })
};


exports.sleep = async function (time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};

/**
 * 并发控制
 * @param paramList
 * @param limit
 * @param fn
 * @returns {Promise<Array>}
 */
exports.mapLimit = async function (paramList, limit = 0, fn, target = null) {
    let currentBucket = [];
    let taskNumber = 0;
    let result = [];
    for (let param of paramList) {
        currentBucket.push(fn.bind(target, param)());
        taskNumber++;
        if (taskNumber === limit && limit > 0) {
            let _bucketResult = await Promise.all(currentBucket);
            currentBucket = [];
            taskNumber = 0;
            result = result.concat(_bucketResult);
        }
    }
    if (currentBucket.length > 0) {
        result = result.concat(await Promise.all(currentBucket));
    }
    return result;
};
