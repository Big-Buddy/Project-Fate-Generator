var AM = require('./modules/account-manager');

module.exports = function(app)
{
	app.get('/', function (req, res)
	{
		if (req.cookies.user == undefined || req.cookies.pass == undefined)
		{
			res.sendFile(__dirname + '/views/index.html');
		}
		else
		{
			//auto login logic
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o)
			{
				if (o != null)
				{
					req.session.user = o;
					res.redirect('/views/user_prof.html');
				}
				else
				{
					res.sendFile(__dirname + '/views/index.html');
				}
			});
		}
	});

	app.post('/', function(req, res)
	{
		AM.manualLogin(req.body['user'], req.body['pass'], function(err, o)
		{
			if (!o)
			{
				res.status(400).send(err);
			}
			else 
			{
				req.session.user = o;
				if (req.body['remember-me'] == 'true')
				{
					res.cookie('user', o.user, {maxAge: 90000});
					res.cookie('pass', o.pass, {maxAge: 90000});
				}
				res.status(200).send(o);
			}
		});
	});

	app.get('/user_prof', function(req, res) {
		if (req.session.user == null)
		{
			// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	
		else
		{
			res.sendFile(__dirname + '/views/user_prof.html');
		}
	});

	app.get('/user_reg'), function(req, res)
	{
		console.log('req received for user_reg');
		res.sendFile(__dirname + '/views/user_reg.html');
	}

	app.post('/user_reg', function(req, res)
	{
		AM.addAccount({
			user : req.body['user'],
			pass : req.body['pass'],
			email : req.body['email']
		}, function(e)
		{
			if (e)
			{
				res.status(400).send(e);
			}
			else
			{
				res.status(200).send('ok');
			}
		});
	});

};