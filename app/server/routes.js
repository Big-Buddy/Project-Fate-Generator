var AM = require('./modules/account-manager');
var PM = require('./modules/profile-manager');
var SG = require('./modules/sequence-generator');
var bodyParser = require('body-parser');

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
			res.render('user_prof', {electivesList:PM.exportElectives(), coreList:PM.exportCores()});
		}
	});

	app.post('/user_prof', function(req, res)
	{
		/*AM.saveUserPreferences(req.session.user, {
			starting_semester : req.body['starting_semester'],
			summer_option : req.body['summer_opt'],
			electives : req.body["electives"],
			completed : req.body["completed"]
		});*/
		var sequence = SG.generator(req.body['starting_semester'], req.body['summer_opt'], SG.parseToJson(req.body["electives"], req.body["completed"]), SG.exportCompletedCourseIDs(req.body["completed"]));

		if (sequence)
		{
			app.set('data',sequence);
			res.status(200).send(sequence);
		}
		else
		{
			res.status(400).send('Failed to generate sequence.');
		}
	});

	app.get('/sequence', function(req,res)
	{
		if (req.session.user == null)
		{
			// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	
		else
		{	
			res.render('sequence',{sequenceData: app.get('data')}); //data goes in render parameters like in /user_prof GET
		} 
	})

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
				res.status(400).send('Password change unsuccessful.');
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