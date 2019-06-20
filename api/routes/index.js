const hotels = require('./hotels');
const users = require('./users');


module.exports = (app) => {
    app.use('/hotels', hotels);
    app.use('/user', users);

    app.use((req, res, next) => {
        let data = {};
        if(res.data){
            data = res.data;
        }
        res.json({
            code: 0,
            data,
        });
    });

};
