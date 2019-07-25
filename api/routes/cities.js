const express = require('express');
const router = express.Router();
const service = require('../service/cities');
const _ = require('lodash');

router.get('/', async function (req, res, next) {
    let list = await service.list();
    res.data = list;
    next();
});

module.exports = router;