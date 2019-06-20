var http = require("http");

var options = {
    host: "101.231.104.82",
    port: 80,
    path: "https://www.google.com",
    headers: {
        Host: "www.google.com"
    }
};
http.get(options, function(res) {
    console.log(res);
    res.pipe(process.stdout);
});