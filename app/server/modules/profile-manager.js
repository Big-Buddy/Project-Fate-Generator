/*var pg = require('pg');

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

exports.checkCourse = function(courseList, searchInput, callback)
{
	var holdData;
	console.log(courseList);
	for (var course in courseList)
	{
		var courseCode = courseList[course].course_program + '' + courseList[course].course_number;
		if (courseCode = searchInput)
		{
			holdData = courseList[course];
		}
	}

	if (holdData)
	{
		callback(null, holdData);
	}
	else
	{
		callback('could-not-find-course', null)
	}
}*/