const Hotels = require('../model').Hotel;

/**
 *
 * @param cityId
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<*>}
 */
const list = async function (cityId, pageSize, pageNumber) {
    let skip = (pageNumber - 1) * pageSize;
    const condition = {Source: 'Agoda'};
    if (cityId) {
        condition.CityId = cityId;
    }
    let result = await Promise.all([
        Hotels.find(condition).select({
            '_id': false,
            'Highlights._id': false,
            'Prices._id': false,
            '_v': false
        }).skip(skip).limit(pageSize).lean(),
        Hotels.countDocuments(condition)
    ]);
    return {rows:result[0],total:result[1]};
};

exports.list = list;