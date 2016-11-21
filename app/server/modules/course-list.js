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

module.exports = getCourseList();

var getCourseList = function()
{
	var courseSearchList = [];

	pool.connect(function(err, client)
	{
		if (err) 
		{
			return console.error('error fetching client from pool', err);
		} 
		else
		{
			client.query('SELECT * FROM public.courses', function(err, res)
			{
				courseSearchList = res.rows;
			});

			return courseSearchList; 
		}
	});
}

