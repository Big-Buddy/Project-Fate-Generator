var http = require('http');
var express = require('express');
var app = express();
var session = require('express-session');
var pg = require('pg');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/app/server/views');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/app/'));

app.use(session(
{
	secret: "whateveryoulikebb",
	proxy: true,
	resave: true,
	saveUninitialized: true,
}));

require('./app/server/routes')(app);

http.createServer(app).listen(app.get('port'), function()
{
	console.log('Express server listening on port ' + app.get('port'));
});