var AM = require('./modules/account-manager');

module.exports = function(app)
{
	app.get('/', function (req, res)
	{
		console.log('req received for index');
		if (req.cookies.user == undefined || req.cookies.pass == undefined)
		{
			res.render('index');
		}
		else
		{
			//auto login logic
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o)
			{
				if (o != null)
				{ 
					req.session.user = o;
					res.redirect('/user_prof');
				}
				else
				{
					res.render('index');
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

	app.get('/user_reg', function(req, res)
	{
		console.log('req received for user_reg');
		res.render('user_reg');
	});

	app.post('/user_reg', function(req, res)
	{
		AM.addAccount({
			user : req.body['user'],
			pass : req.body['pass'],
			email : req.body['email']
		}, function(err)
		{
			if (err)
			{
				res.status(400).send(err);
			}
			else
			{
				res.status(200).send('ok');
			}
		});
	});

	app.get('/user_prof', function(req, res) {
		console.log('req received for user_prof');
		if (req.session.user == null)
		{
			// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	
		else
		{
			res.render('user_prof');
		}
	});

};