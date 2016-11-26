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
var courseList=[];
var lectureList=[];
var labList=[];
var tutorialList=[];
/*
anonymous {
id: 80,
course_program: 'ENGR',
course_number: 233,
credits: 3,
course_name: 'Applied Advanced Calculus',
course_type: 0,
prerequisites: [],
priority: 2,
course_id: 4,
section_code: 'XB',
start_time: 1415,
end_time: 1555,
days: '----F--',
semester: 'Winter',
lecture_id: 30 }*/

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
		var sqlQuery='SELECT * FROM public.courses ORDER BY id';
		client.query(sqlQuery, function(err, res)
		{
			courseList = res.rows;
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

exports.parseToJson = function(electives, completed)
{
	//loop through full course list:
	for(course in courseList){
		var lectureListForThisCourse = [];
		//match this courseID with according lectures from the full lectureList

		for(lecture in lectureList){
			if(courseList[course].id==lectureList[lecture].course_id){
				//match this lectureID with according labs from the full lab list
				var labSections=[];
				for(lab in labList){
					if(lectureList[lecture].id==labList[lab].lecture_id){
						var labSection= {
                                "section_code": labList[lab].section_code, 
                                "days": labList[lab].days,
                                "start_time": labList[lab].start_time, 
                                "end_time": labList[lab].end_time
                            };
                           labSections.push(labSection);
					}
				}


				//match this lectureID with according tutorials from the full lab list
				var tutorialSections=[];
				for(tutorial in tutorialList){
					if(lectureList[lecture].id==tutorialList[tutorial].lecture_id){
						//console.log("matching tutorial found");
						var tutorialSection={
							"lecture_id":tutorialList[tutorial].lecture_id,
							"section_code": tutorialList[tutorial].section_code,
							"days": tutorialList[tutorial].days,
							"start_time": tutorialList[tutorial].start_time,
							"end_time": tutorialList[tutorial].end_time
						}
						tutorialSections.push(tutorialSection);
					}
				}

				var lectureElement ={
					"semester": lectureList[lecture].semester,
					"section_code": lectureList[lecture].section_code,
					"days": lectureList[lecture].days,
					"start_time": lectureList[lecture].start_time,
					"end_time": lectureList[lecture].end_time,
					"tutorialSections":tutorialSections,
					"labSections": labSections
				}
				lectureListForThisCourse.push(lectureElement);
			}
		}
		var element = {
			"courseID":courseList[course].id,
			"course_name":courseList[course].course_name,
			"course_number":courseList[course].course_number,
			"lectureSections":lectureListForThisCourse
		}
		console.log(element.lectureSections[1].tutorialSections[0].days);
		break;
	}
	return "done";
	//return courseList[41];
	//return courseList[5];
	//return labList[1];
	//return tutorialList[1];
	//return lectureList[1];
	//return courselist
};
//1. get all the core courses (course_type = 0)
//3. add all the chosen electives (checked and course_type=1 || course_Type=2 || course_type=3)
//2. subtract completed courses (checked and course_type = 0)

//FULL LIST SKELETON COMPLETE

//4. add all lectures sections to each course
//5. add all tutorial sections to each course
//6. add all lab sections to each course

//FULL LIST COMPLETE

//*** The following should be done in the context of a separate page where the sequence is displayed, not user_prof***
//1. Pass Full List to sequence algorithm
//2. Display output   