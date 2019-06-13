const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set("debug", (collectionName, method, query, doc) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});
mongoose.connect('mongodb://192.168.99.100:27017/Hotels', {
    poolSize: 10,
    useNewUrlParser: true,
});

mongoose.connection.on('connected',()=>{
    console.log('Mongodb connected');
});
mongoose.connection.on('error',(err)=>{
    console.error(err);
});


const FailRequestLogs = mongoose.model('FailRequestLogs', new Schema({
    RequestId: String,
    CityId: Number,
    PageSize: Number,
    PageNumber: Number,
    CheckIn: Date,
    CheckOut: Date,
}));

const Hotel = mongoose.model('Hotel', new Schema({
    HotelId: Number,
    CityId: Number,
    CityName: String,
    CountryId: Number,
    CountryName: String,
    ThumbnailUrl: String,
    EnglishHotelName: String,
    HotelDisplayName: String,
    HotelUrl: String,
    Prices: [{
        date: Date,
        DisplayPrice: Number,
        CrossOutPrice: Number,
        DiscountValue: Number,
    }]
}));

//module.exports = mongoose;
exports.Hotel = Hotel;
exports.FailRequestLogs = FailRequestLogs;