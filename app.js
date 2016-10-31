var http = require('http');
var express = require('express');
var session = require('express-session');
var pg = require('pg');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.locals.pretty = true;
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/app/server/views');
app.set('view engine', 'jade');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
app.use(express.static(__dirname + '/app/public'));

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