const express = require('express');
const jwt = require('jsonwebtoken');
const service = require('../service/service');
const utils = require('../utils/constant');
const router = express.Router();

router.post('/login', async function (req, res, next) {
    let email = req.body.username;
    let password = req.body.password;
    res.data = {token: 1234};
    return next();
    const user = await service.findUserByEmailAndPwd(email, password);
    if (user) {
        let token = jwt.sign({level: user.level}, utils.secretKey, {
            expiresIn: 60 * 60 // 授权时效1小时
        });
        res.data = {token: token};
    } else {
        const error = new Error('用户不存在，或者密码错误');
        return next(error);
    }
    next();
});

router.post('/register', async function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    let level = req.body.level;
    await service.createUser(email, password, level);
    res.data = true;
    next();
});

router.post('/abandon', async function (req, res, next) {

})

module.exports = router;
