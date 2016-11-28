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

//This function takes in the information pulled from database, 
//and stores it into an array of JSON objects that are modified to match the requested input format
var parseDBArrayToJson = function(DBArray){
	//loop through full course list:
	var jsonArrayOfCourses=[];
	for(course in DBArray){
		var lectureListForThisCourse = [];
		//match this courseID with according lectures from the full lectureList

		for(lecture in lectureList){
			if(DBArray[course].id==lectureList[lecture].course_id){
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
			"courseID":DBArray[course].id,
			"course_name":DBArray[course].course_name,
			"course_number":DBArray[course].course_number,
			"lectureSections":lectureListForThisCourse
		}
		jsonArrayOfCourses.push(element);
		//console.log(element.course_name);
	}
	return jsonArrayOfCourses;
}

//removes an element from JSONArray, matching the CourseID passed in
var removeJsonElementsByCourseID= function(CourseID, JSONArray){
	for(elementIndex in JSONArray){
		if(JSONArray[elementIndex].courseID==CourseID){
			console.log("elementIndex: "+elementIndex);
			console.log("Course ID: "+CourseID);
			JSONArray.splice(elementIndex,1);
			// console.log(JSONArray);
		}
	}
	return JSONArray;
}
//removes all courses from JSONArray that match course IDs in CourseIDArray
var removeJsonElementsByCourseIDArray= function(CourseIDArray, JSONArray){
	for(courseIDIndex in CourseIDArray)
		JSONArray=removeJsonElementsByCourseID(CourseIDArray[courseIDIndex],JSONArray);
	return JSONArray;
}

//creates a new array of JSON objects by courseID, pulled from JSONArray that was passed to the function
var compileCourseListByCourseID= function(CourseID, JSONArray){
	var courseListByCourseID=[];
	for(course in JSONArray){
		for(id in CourseID){
			if(JSONArray[course].courseID==CourseID[id])
				courseListByCourseID.push(JSONArray[course])
			}
	}
	return courseListByCourseID;
}

//appends secondaryArray to mainArray
var concatenate2Arrays=function(mainArray, secondaryArray){
	for(i=0;i<secondaryArray.length;i++){
		mainArray.push(secondaryArray[i]);
	}
	return mainArray;
}

//since completed value comes in a string, where id is the first part of the string delimited by a dot,
//it picks up that id and stores it into an integer array
var filterCompletedCourseIDs= function(completed){
	var completedCourseIDs=[];
	for(course in completed){
		completedCourseIDs.push(parseInt(completed[course].split(".")[0]));
	}
	return completedCourseIDs;
}
exports.parseToJson = function(electives, completed)
{
	//loop through full course list:
	var parsedCoreList = parseDBArrayToJson(coreList);
	var parsedElectiveList = parseDBArrayToJson(electivesList);
	var desiredElectiveList = compileCourseListByCourseID(electives,parsedElectiveList);
	var remainingCoreList = removeJsonElementsByCourseIDArray(filterCompletedCourseIDs(completed),parsedCoreList);
	var totalCoursesList = concatenate2Arrays(remainingCoreList,desiredElectiveList);
	console.log(totalCoursesList);
	//console.log(compileCourseListByCourseID(electives,parsedElectiveList));
	
	//console.log(filterCompletedCourseIDs(completed));
	//console.log(corseList.lectureSections[1].semester);
	//parseDBArrayToJson(electivesList);
	//var completedID = completed.split('.');
	//console.log(completedID[0]);
	//var removingID=[1,2,3,67];
	// console.log("electives id: "+electives);
	// console.log("completed id: "+completed);
	//console.log(corseList);
	// console.log("removing " +completed);
	//corseList=removeJsonElementsByCourseIDArray(removingID,corseList);
	//corseList=removeJsonElementsByCourseIDArray(67,corseList);
	//console.log(corseList);
	return "hello world";
};


//1. get all the core courses (course_type = 0)
//1.1 parsed all elective
//1.3 pick out the elective json objects from the full electives list, based on the id's that were passed to me from routes.js
//1.4 subtract all the courses with ID matching to the one that was passed to me from routes.js
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