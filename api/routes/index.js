const hotels = require('./hotels');
const users = require('./users');
const cities = require('./cities');
const jwtM = require('../middleware/jwt');

module.exports = (app) => {
    //app.use(jwtM);
    app.use('/hotels', hotels);
    app.use('/user', users);
    app.use('/cities', cities);

    app.use((req, res, next) => {
        let data = {};
        if (res.data) {
            data = res.data;
        }
        res.json({
            code: 0,
            data,
        });
    });

    app.use((err, req, res, next) => {
        res.json({
            code: 500,
            message: err.message
        })
        console.error(err);
    })

};
