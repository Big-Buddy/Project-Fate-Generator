var AM = require('./modules/account-manager');
var pg = require('pg');
//var CL = require('./modules/course-list');

var Electives=[3];
var config = {
	user: 'zzbygkffahkpgs',
	database: 'da0j4pvoutaat3',
	password: 'BspcDxUsbS1jlNylTPGE-_57bV',
	host: 'ec2-23-21-100-145.compute-1.amazonaws.com',
	port: '5432',
	max: 10,
	idleTimeoutMillis: 3000,
};

pg.defaults.ssl = true;
var pool = new pg.Pool(config);

//get all existing accounts
pool.connect(function(err, client)
{
	if (err) 
	{
		return console.error('error fetching client from pool', err);
	} 
	else
	{
		client.query('SELECT * FROM public.courses WHERE course_type = ' + 1, function(err, res)
		{
			Electives[0] = res.rows;
			console.log(Electives[0]);
			console.log("End of query for 1");
		});
		client.query('SELECT * FROM public.courses WHERE course_type = ' + 2, function(err, res)
		{
			Electives[1] = res.rows;
			console.log(Electives[1]);
			console.log("End of query for 2");
		});
		client.query('SELECT * FROM public.courses WHERE course_type = ' + 3, function(err, res)
		{
			Electives[2] = res.rows;
			console.log(Electives[2]);
			console.log("End of query for 3");
		});
	}
});


module.exports = function(app)
{
	app.get('/', function (req, res)
	{
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
				//TO IMPLEMENT - Remember-me button
				/*if (req.body['remember-me'] == 'true')
				{
					res.cookie('user', o.user_name, {maxAge: 90000});
					res.cookie('pass', o.user_password, {maxAge: 90000});
				}*/

				res.status(200).send(o);
			}
		});
	});

	app.get('/user_prof', function(req, res) 
	{
		if (req.session.user == null)
		{
			// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	
		else
		{
			console.log("in user_prof render");
			res.render('user_prof', {courseList:Electives});
		}
	});

	app.post('/user_prof', function(req, res)
	{
		//TO IMPLEMENT: save User preferences & sequence generate
	});

	app.get('/change', function(req, res)
	{
		if (req.session.user == null)
		{
			// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	
		else
		{
			res.render('change');
		}
	});

	app.post('/change', function(req, res)
	{

		var newPass = req.body['pass'];
		var user = req.session.user;

		AM.changePassword(user, newPass, function(e, o)
		{
			if (o)
			{
				req.session.destroy(function(e)
				{
					res.status(200).send('Password successfully changed. Please relog.');
				});
			}
			else
			{
				res.status(400).send('Password change unsuccessful.')
			}
		});
	});

	app.post('/logout', function(req, res)
	{
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e)
		{
			res.status(200).send('Logout good!');
		});

	});

	app.get('/user_reg', function(req, res)
	{
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
				res.status(200).send('The account was added!');
			}
		});
	});

	app.get('/montrealInSummer', function(req, res)
	{
		res.render('montrealInSummer');
	});
};