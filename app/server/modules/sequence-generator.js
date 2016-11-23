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

//1. get all the core courses (course_type = 0)
//2. subtract completed courses (checked and course_type = 0)
//3. add all the chosen electives

//FULL LIST SKELETON COMPLETE

//1. add all lectures sections to each course
//2. add all tutorial sections to each course
//3. add all lab sections to each course

//FULL LIST COMPLETE

//*** The following should be done in the context of a separate page where the sequence is displayed, not user_prof***
//1. Pass Full List to sequence algorithm
//2. Display output   