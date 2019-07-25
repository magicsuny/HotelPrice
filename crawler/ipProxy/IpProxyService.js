const model = require('./model');

exports.getRandom = async function (sampleNumbers) {
    try {
        let result = await model.Proxy.aggregate().match({isValid: true}).sample(sampleNumbers);
        return result;
    } catch (e) {
    }
};
