const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set("debug", (collectionName, method, query, doc) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});
mongoose.connect('mongodb://192.168.99.100:27017/IpProxy', {
    poolSize: 10,
    useNewUrlParser: true,
});

mongoose.connection.on('connected', () => {
    console.log('Mongodb connected');
});
mongoose.connection.on('error', (err) => {
    console.error(err);
});

const Proxy = mongoose.model('Proxy', new Schema({
    ip: String,
    port: String,
    protocol: String,
    isValid:Boolean,
}));

exports.Proxy = Proxy;