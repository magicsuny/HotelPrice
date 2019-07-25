const Cities = require('../model').City;

const list = async function () {
    return await Cities.find({}).sort({countryName: 1, cityName: 1}).lean();
};

exports.list = list;