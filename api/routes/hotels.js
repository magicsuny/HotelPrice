const express = require('express');
const router = express.Router();
const service = require('../service/hotels');
const _ = require('lodash');

/* GET users listing. */
router.get('/', async function (req, res, next) {
    let pageSize = Number(req.query.pagesize);
    let pagenumber = Number(req.query.pagenumber);
    let cityId = req.query.cityId;
    let result = await service.list(cityId, pageSize, pagenumber);

    result.rows.forEach((item) => {
        let minPrice = {
            date:null,
            price:null,
            url:null,
        };
        for (let [key, price] of Object.entries(item.Prices)){
            if(minPrice.price==null||price.DisplayPrice<minPrice.price){
                minPrice.price = Math.round(price.DisplayPrice);
                minPrice.crossPrice = price.CrossOutPrice;
                minPrice.discount = price.CrossOutPrice>0?(((price.CrossOutPrice-price.DisplayPrice)/price.CrossOutPrice)*100).toFixed(0):0;
                minPrice.date = price.formatDate;
                minPrice.url = `https://www.agoda.com${price.url}`;
            }
        }
        item.minPrice = minPrice;
    });
    res.data = result;
    next();
});

module.exports = router;
