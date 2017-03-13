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
var coreList=[];
var electivesList=[];
var lectureList=[];
var labList=[];
var tutorialList=[];

var jsonStructure = {

}

pool.connect(function(err, client)
{
	if (err) 
	{
		return console.error('error fetching client from pool', err);
	} 
	else
	{
		var sqlQuery='SELECT * FROM public.courses WHERE course_type=0';
		client.query(sqlQuery, function(err, res)
		{
			coreList = res.rows;
		});
		var sqlQuery='SELECT * FROM public.courses WHERE course_type=1 OR course_type=2 OR course_type=3';
		client.query(sqlQuery, function(err, res)
		{
			electivesList = res.rows;
		});
		sqlQuery='SELECT * FROM public.lectures';
		client.query(sqlQuery, function(err, res)
		{
			lectureList = res.rows;
		});
		sqlQuery='SELECT * FROM public.tutorials';
		client.query(sqlQuery, function(err, res)
		{
			tutorialList = res.rows;
		});		
		sqlQuery='SELECT * FROM public.labs';
		client.query(sqlQuery, function(err, res)
		{
			labList = res.rows;
		});		
	}
});


//This is what remains after cleaning this module, the code which was originally here
//was too buggy and difficult to read to refactor, it simply needed to be rewritten - Alex
//The main issue with the original code was that it ran as a stand alone program rather than
//a library. The use of buffers was a quick, sloppy solution when this code was "delivered" 
//very close to the due date.
exports.generator = function(term, summerOption, incompleteCourses, completeCourses)
{
    var startingSemester = term;
    var summer=(summerOption=='yes')?true:false;
    var coursesPerSemester = 5;
    var semesters = [];
    var onlineCourses = [];
    var potentialCourses = [];
    var lowPriorityCourses = [];
    var potentialCourseSections = [];
    var conflictCounterForSections = [];
    var semesterCounter = 0;

    while(incompleteCourses.length > 0)
    {
        potentialCourses = addToPotentialList(term, incompleteCourses, potentialCourses);

        potentialCourses = remove400LevelCourses(potentialCourses, incompleteCourses);

        potentialCourses = removeIncompletePrerequisiteCourses(potentialCourses, completeCourses);

        var holder1 = selectCoursesForSemester(coursesPerSemester, onlineCourses, potentialCourses, lowPriorityCourses);

        lowPriorityCourses = holder1[0];
        potentialCourses = holder1[1];
        onlineCourses = holder1[2];

        conflictCounterForSections = initializeConflictCounterForSections(term, potentialCourses);

        conflictCounterForSections = countTimeConflicts(term, potentialCourses, conflictCounterForSections);

        //potentialCourseSections = selectSections(coursesPerSemester, potentialCourses, conflictCounterForSections, potentialCourseSections);

        var holder2 = prepNextIteration(semesterCounter, term, summer, onlineCourses, semesters, incompleteCourses, completeCourses, potentialCourses, lowPriorityCourses,conflictCounterForSections);

        term = holder2[0];
        completeCourses = holder2[1];
        incompleteCourses = holder2[2];
        semesters = holder2[3];
        onlineCourses = holder2[4];
        lowPriorityCourses = holder2[5];
        potentialCourses = holder2[6];
        potentialCourseSections = holder2[7];
        conflictCounterForSections = holder2[8];

        semesterCounter++;
    }

    return sequencer(semesters, startingSemester, summer);
}