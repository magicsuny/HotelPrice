const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.set('useCreateIndex', true);
mongoose.set('debug', (collectionName, method, query, doc) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query), doc)
})
mongoose.connect('mongodb://192.168.99.100:27017/Hotels', {
    poolSize: 10,
    useNewUrlParser: true
})

mongoose.connection.on('connected', () => {
    console.log('Mongodb connected')
})
mongoose.connection.on('error', (err) => {
    console.error(err)
})

const User = mongoose.model('Users', new Schema({
    Email: {
        type:String,
        unique:true
    },
    Password: String,
    Level: String
}))
const FailRequestLog = mongoose.model('FailRequestLogs', new Schema({
    RequestId: String,
    CityId: Number,
    PageSize: Number,
    PageNumber: Number,
    CheckIn: Date,
    CheckOut: Date
}))

const Hotel = mongoose.model('Hotels', new Schema({
    Source: String,
    HotelId: Number,
    CityId: Number,
    CityName: String,
    CountryId: Number,
    CountryName: String,
    ThumbnailUrl: String,
    EnglishHotelName: String,
    HotelDisplayName: String,
    Latitude: String,
    Longitude: String,
    HotelUrl: String,
    MainPhotoUrl: String,
    Highlights: [{
        icon: String,
        id: Number,
        title: String
    }],
    Prices: {
        type: mongoose.Mixed
    }
    // Prices: [{
    //     date: Date,
    //     formatDate: String,
    //     url: String,
    //     DisplayPrice: Number,  //现价
    //     CrossOutPrice: Number, //原价
    //     DiscountValue: Number,
    // }]
}))

const City = mongoose.model('Cities', new Schema({
    cityId: Number,
    cityName: String,
    cityEnglishName: String,
    countryId: Number,
    countryName: String,
}))

// module.exports = mongoose;
exports.Hotel = Hotel
exports.FailRequestLog = FailRequestLog
exports.User = User
exports.City = City
