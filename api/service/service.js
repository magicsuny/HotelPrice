const City = require('../model').City;
const Users = require('../model').User;
const constant = require('../utils/constant');

const list = async function () {
    return await City.find({}).sort({countryName: 1, cityName: 1}).lean();
};

const findUserByEmailAndPwd = async function (email, password) {
    password = constant.md5(password);
    const user = await Users.findOne({Email: email, Password: password});
    return user;
};

const createUser = async function (email, password, level = 0) {
    password = constant.md5(password);
    await Users.create({email, password, level});
};

(async () => {
    try {
        await createUser('admin@console.com', 12345678, 0)
    } catch (e) {
        console.error(e);
    }

})();

exports.list = list;
exports.findUserByEmailAndPwd = findUserByEmailAndPwd;
exports.createUser = createUser;