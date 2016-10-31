var crypto = require('crypto');
var pg = require('pg');

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
var accounts = [];

//get all existing accounts
pool.connect(function(err, client)
{
	if (err) 
	{
		return console.error('error fetching client from pool', err);
	} 
	else
	{
		client.query('SELECT * FROM public.users', function(err, res)
		{
			accounts = res.rows;
		});
	}
});

//attempt autologin
exports.autoLogin = function(user, pass, callback)
{
	accounts.find({user_name: user}, function(o)
	{
		if(o)
		{
			o.user_pass == pass ? callback(o) : callback(null);
		}
		else
		{
			callback(null);
		}
	});
};

//manual login
exports.manualLogin = function(user, pass, callback)
{
	accounts.find(function(userCredentials)
	{
		if (userCredentials.user_name === user)
		{
			validatePassword(pass, userCredentials.user_password, function(err, res) 
			{
				if (res)
				{
					callback(null, o);
				}	
				else
				{
					callback('invalid-password');
				}
			});
		}	
		else
		{
			callback('user-not-found');
			
		}
	});
};

//account registration
exports.addAccount = function(newData, callback)
{
	accounts.find(function(userCredentials) 
	{
		if (userCredentials.user_name === newData.user)
		{
			callback('username-taken');
		}	
		else
		{
			accounts.find(function(userCredentials) 
			{
				if (userCredentials.email === newData.email)
				{
					callback('email-taken');
				}	
				else
				{
					saltAndHash(newData.pass, function(hash)
					{
						newData.pass = hash;
						pool.connect(function(err, client)
						{
							if (err) 
							{
								return console.error('error fetching client from pool', err);
							}
							else
							{
								client.query('INSERT INTO public.users(user_name, user_password, user_email) VALUES ( ' + newData.user + ',' + newData.pass + ',' + newData.email + ')', function(err, res)
								{
									if (err)
									{
										console.log('Failed to add new account to database.');
									}
									else
									{
										console.log('User successfully added.');
									}
								});
							} 
						});
					});
				}
			});
		}
	});
};

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
};

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
};

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}
//TO-DO update account info
//TO-DO update password

