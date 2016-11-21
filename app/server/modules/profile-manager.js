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
var Electives=[3];
var Cores=[];

//get Electives and Cores
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
		});
		client.query('SELECT * FROM public.courses WHERE course_type = ' + 2, function(err, res)
		{
			Electives[1] = res.rows;
		});
		client.query('SELECT * FROM public.courses WHERE course_type = ' + 3, function(err, res)
		{
			Electives[2] = res.rows;
		});
		client.query('SELECT * FROM public.courses WHERE course_type = ' + 0, function(err, res)
		{
			Cores = res.rows;
		});
	}
});

exports.exportCores = function()
{
	return Cores;
}

exports.exportElectives = function()
{
	return Electives;
}