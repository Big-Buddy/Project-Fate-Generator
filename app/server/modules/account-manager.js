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
	var holdData;

	accounts.find(function(userCredentials)
	{
		if(userCredentials.user_name === user)
		{
			holdData = userCredentials;
			o.user_pass == pass ? callback(o) : callback(null);
		}
	});

	if (holdData)
	{
		holdData.user_pass === pass ? callback(holdData) : callback(null);
	}
};

//manual login
exports.manualLogin = function(user, pass, callback)
{
	var holdData;

	accounts.find(function(userCredentials)
	{
		if (userCredentials.user_name === user)
		{
			holdData = userCredentials;
		}	
	});

	if (holdData)
	{
		validatePassword(pass, holdData.user_password, function(err, res) 
			{
				if (res)
				{
					callback(null, holdData);
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
	
};

//account registration
exports.addAccount = function(newData, callback)
{
	var holdData;

	accounts.find(function(userCredentials) 
	{
		if (userCredentials.user_name === newData.user || userCredentials.user_email === newData.email)
		{
			holdData = userCredentials;
		}	
	});

	if (holdData)
	{
		holdData.user_name === newData.user ? callback('username-taken') : callback('email-taken');
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
								client.query('INSERT INTO public.users(user_name, user_password, user_email) VALUES (\'' + newData.user + '\',\'' + newData.pass + '\',\'' + newData.email + '\')', function(err, res)
								{
									if (err)
									{
										console.log('Failed to add new account to database.');
									}
									else
									{
										console.log('User successfully added.');
										updateAccounts(pool);
										callback();
									}
								});
							} 
						});
					});
	}
};

//Change the user's password.
exports.changePassword = function(user, newPass, callback)
{
	var holdData;

	accounts.find(function(userCredentials) 
	{
		if (userCredentials.user_name === user.user_name)
		{
			holdData = userCredentials;
		}	
	});

	if (holdData)
	{
		saltAndHash(newPass, function(hash)
		{
			holdData.pass = hash;
			pool.connect(function(err, client)
						{
							if (err) 
							{
								return console.error('error fetching client from pool', err);
							}
							else
							{
								client.query('UPDATE public.users SET user_password = \'' + holdData.pass + '\' WHERE user_id = ' + holdData.user_id + ';', function(err, res)
								{
									if (err)
									{
										console.log('Failed to update password of ' + holdData.user_name + ' in database.');
									}
									else
									{
										console.log('User\'s password successfully changed.');
										updateAccounts(pool);
										callback(null, holdData);
									}
								});
							} 
						});
		});		
	}
	else
	{
		callback('Couldn\'t find user to change password.', null)
	}
}

//Update Accounts list after new account creation
var updateAccounts = function(pool)
{
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
};

//TO-DO save user preferences

//BASIC PASSWORD ENCRYPTION------------------------

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
	return;
};

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}