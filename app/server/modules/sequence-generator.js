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
                                "lecture_id": labList[lab].lecture_id,
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
			"id":DBArray[course].id,
			"course_name":DBArray[course].course_name,
			"course_number":DBArray[course].course_number,
            "course_program":DBArray[course].course_program,
			"lectureSections":lectureListForThisCourse,
            "priority":DBArray[course].priority,
            "prerequisites":DBArray[course].prerequisites
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
			//console.log("elementIndex: "+elementIndex);
			//console.log("Course ID: "+CourseID);
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

exports.exportCompletedCourseIDs = function(completed)
{
    var completedCourseIDs=[];
    for(course in completed)
    {
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
	return totalCoursesList;
};

//SEQUENCE GENERATOR IMPLEMENTATION

//Takes as parameters the type of semester, the list of all incomplete courses and
//an empty potential course list and populates it with courses that are offered in the same term
var addToPotentialList = function(term, incompleteCourses, StubPotentialCourses)
{
    var i;
    var j;
    var potentialCourses=StubPotentialCourses;
    for(i = 0; i < incompleteCourses.length; i++)
    {
        for(j = 0; j < incompleteCourses[i].lectureSections.length; j++)
        {
            if(incompleteCourses[i].lectureSections[j].semester.toLowerCase() == term.toLowerCase())
            {
                potentialCourses.push(JSON.parse(JSON.stringify(incompleteCourses[i])));
                break;
            }
        }
    }

    return potentialCourses;
    /*
    for(i = 0; i < potentialCourses.length; i++)
    {
        document.write(potentialCourses[i].course_program.concat(potentialCourses[i].course_number) + " ");
    }
    document.write("<br>");
    document.write("<br>");
    */
}


//Takes as parameters the list of potential courses and 
//the list of all incomplete courses and removes all 400 level courses 
//from the potential course list if there are any incomplete 200 level courses
var remove400LevelCourses = function(potentialCourses, incompleteCourses)
{
    var i;
    var remove400 = false;

    for(i = 0; i < incompleteCourses.length; i++)
    {
        if (JSON.stringify(incompleteCourses[i].course_number)[0] == '2')
        {
            remove400 = true;
            break;
        }
    }
    if(remove400 == true)
    {
        for (i = 0; i < potentialCourses.length; i++)
        {
            if (JSON.stringify(potentialCourses[i].course_number)[0] == '4')
            {
                
                potentialCourses.splice(i, 1)
                i--;
            }
        }
    }

    return potentialCourses;
    /*
    for(i = 0; i < potentialCourses.length; i++)
    {
        document.write(potentialCourses[i].course_program.concat(potentialCourses[i].course_number) + " ");
    }
    document.write("<br>");
    document.write("<br>");
    */
}

//Takes as parameters the list of potential courses and the list of completed courses
//and removes any courses from the potential course list
//that require prerequisites if they have not yet been completed
var removeIncompletePrerequisiteCourses = function(potentialCourses, completeCourses)
{
    var i;
    var j;
    var k;
    var completedPrerequisites = 0;
    
    for(i = 0; i < potentialCourses.length; i++)
    {
        for(j = 0; j < potentialCourses[i].prerequisites.length; j++)
        {
            for(k = 0; k < completeCourses.length; k++)
            {
                if(potentialCourses[i].prerequisites[j] == completeCourses[k])
                {
                    completedPrerequisites++;
                }
            }
            if(completedPrerequisites != potentialCourses[i].prerequisites.length)
            {
                potentialCourses.splice(i, 1)
                i--;
            }
        }
    }
    return potentialCourses;
}

//Takes as parameters the list of potential courses and
//an empty low priority list and uses it to sort the courses by their priority
var sortPotentialList = function(potentialCourses, lowPriorityCourses)
{
    var i;
    var j;
    
    for(i = 0; i < potentialCourses.length; i++)
    {
        var currentLowIndex = 0;
        var currentLowPriority = potentialCourses[0].priority;
        
        for(j = 0; j < potentialCourses.length; j++)
        {
            if(potentialCourses[j].priority < currentLowPriority)
            {
                currentLowIndex = j;
                currentLowPriority = potentialCourses[j].priority;
            }
        }
        
        lowPriorityCourses.push(JSON.parse(JSON.stringify(potentialCourses[currentLowIndex])));
        potentialCourses.splice(currentLowIndex, 1);
        i--; 
    }
    for(i = 0; i < lowPriorityCourses.length; i++)
    {
        potentialCourses.push(JSON.parse(JSON.stringify(lowPriorityCourses[i])));
        lowPriorityCourses.splice(lowPriorityCourses[i], 1);
        i--;
    }
    return potentialCourses;
}

//Takes as parameters the users preference for courses per semester, an empty list of online courses,
//the list of potential courses and an empty low priority list and adds the low priority courses to it
//whilst removeing them from the potential course list
//If the low priority course is an online course it is removed
//from the potential course list and added to the online course list
var selectCoursesForSemester = function(coursesPerSemester, onlineCourses, potentialCourses, lowPriorityCourses)
{
    var i;
    
    for (i = 0; i < potentialCourses.length - (coursesPerSemester - 1); i++)
    {
       lowPriorityCourses.push(JSON.parse(JSON.stringify(potentialCourses[potentialCourses.length - 1])));
       potentialCourses.pop();
       i--;
    }
    if(lowPriorityCourses.length > 0)
    {    
        potentialCourses.push(JSON.parse(JSON.stringify(lowPriorityCourses[0])));
        lowPriorityCourses.shift();
    }
    for (i = 0; i < potentialCourses.length; i++)
    {
        if(potentialCourses[i].lectureSections[0].section_code == "EC")
        {
            onlineCourses.push(JSON.parse(JSON.stringify(potentialCourses[i])));
            potentialCourses.splice(i, 1);
            i--;
        }
    }

    var stuff = [];
    stuff.push(lowPriorityCourses);
    stuff.push(potentialCourses);
    stuff.push(onlineCourses);

    return stuff;

    /*
    for (i = 0; i < potentialCourses.length; i++)
    {
        document.write(potentialCourses[i].course_program.concat(potentialCourses[i].course_number) + " ");
    }
    document.write("<br>");
    document.write("<br>");
    */
}

//Takes as parameters the type of semester and the potential course list
//and creates and returns an array with counters for the conflicts
//between sections of the potential courses with all initialized to 0
var initializeConflictCounterForSections = function(term, potentialCourses)
{
    var i;
    var j;
    var k;
    var numLectureSections = 0;
    var termLectureSection = 0;;
    var createConflictArray = new Array(potentialCourses.length);
    
    for(i = 0; i < createConflictArray.length; i++)
    {
        createConflictArray[i] = new Array(3);
    }
    for(i = 0; i < potentialCourses.length; i++)
    {
       if(potentialCourses[i].lectureSections.section_code != "EC")
       {
            for (j = 0; j < potentialCourses[i].lectureSections.length; j++)
            {
                if(potentialCourses[i].lectureSections[j].semester == term)
                {
                    numLectureSections++;
                    termLectureSection = j;
                }
            }
        }
        if(potentialCourses[i].lectureSections.section_code != "EC")
        {
            createConflictArray[i][0] = new Array(numLectureSections);
            createConflictArray[i][1] = new Array(potentialCourses[i].lectureSections[termLectureSection].tutorialSections.length * numLectureSections)
            createConflictArray[i][2] = new Array(potentialCourses[i].lectureSections[termLectureSection].labSections.length * potentialCourses[i].lectureSections.length)
            numLectureSections = 0;
        }
        if(potentialCourses[i].lectureSections.section_code == "EC")
        {
            createConflictArray[i][0] = new Array(1);
            createConflictArray[i][1] = new Array(0)
            createConflictArray[i][2] = new Array(0)
        }
    }
    for(i = 0; i < createConflictArray.length; i++)
    {
        for(j = 0; j < createConflictArray[i].length; j++)
        {
            for(k = 0; k < createConflictArray[i][j].length; k++)
            {
                createConflictArray[i][j][k] = 0;
            }
        }
    }
    return createConflictArray;
}

//Takes as parameters the type of semester, the potential course list
//and the list of conflicts for each section and tests for conflicts between
//sections while increment corresponding counters if a conflict is found
var countTimeConflicts = function(term, potentialCourses, conflictCounterForSections)
{
    var a;
    var i;
    var j;
    var k;
    var l;
    var x;
    var y;
    var z;
    var termCourseSection1;
    var termCourseSection2;
    var invalidTermSections = 0;
    
    for(i = 0; i < potentialCourses.length; i++)
    {
        for(j = 0; j < potentialCourses.length; j++)
        {
            if(potentialCourses[i].course_program.concat(potentialCourses[i].course_number) != potentialCourses[j].course_program.concat(potentialCourses[j].course_number))
            {
                for(a = 0; a < potentialCourses[i].lectureSections.length; a++)
                {
                    if(potentialCourses[i].lectureSections[a].semester == term)
                    {
                        termCourseSection1 = a;
                        break;
                    }
                }

                for(a = 0; a < potentialCourses[j].lectureSections.length; a++)
                {
                    if(potentialCourses[j].lectureSections[a].semester == term)
                    {
                        termCourseSection2 = a;
                        break;
                    }
                }
                
                //////////////////////////////////////////////////////////////
              
                for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                {
                    if(potentialCourses[i].lectureSections[k].semester != term)
                    {
                        invalidTermSections++;
                    }
                    if(potentialCourses[i].lectureSections[k].semester == term)
                    {
                        for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                        {
                            if(potentialCourses[j].lectureSections[l].semester == term)
                            {
                                for(z = 0; z < 7; z++)
                                {
                                    if((potentialCourses[i].lectureSections[k].days[z] == potentialCourses[j].lectureSections[l].days[z]) && (potentialCourses[i].lectureSections[k].days[z] != "-"))
                                    {
                                        if((potentialCourses[i].lectureSections[k].end_time >= potentialCourses[j].lectureSections[l].start_time) && (potentialCourses[i].lectureSections[k].end_time <= potentialCourses[j].lectureSections[l].end_time))
                                        {
                                            conflictCounterForSections[i][0][k - invalidTermSections]++;
                                        }
                                        if((potentialCourses[j].lectureSections[l].end_time >= potentialCourses[i].lectureSections[k].start_time) && (potentialCourses[j].lectureSections[l].end_time <= potentialCourses[i].lectureSections[k].end_time))
                                        {
                                            conflictCounterForSections[i][0][k - invalidTermSections]++;
                                        }
                                    }
                                }    
                            }
                        }
                    }
                }
                
                invalidTermSections = 0;
                if(potentialCourses[j].lectureSections[termCourseSection2].tutorialSections.length > 0)
                {
                    for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                    {
                        if(potentialCourses[i].lectureSections[k].semester != term)
                        {
                            invalidTermSections++;
                        }
                        if(potentialCourses[i].lectureSections[k].semester == term)
                        {
                            for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                            {
                                if(potentialCourses[j].lectureSections[l].semester == term)
                                {
                                    for(x = 0; x < potentialCourses[j].lectureSections[l].tutorialSections.length; x++)
                                    {
                                        for(z = 0; z < 7; z++)
                                        {
                                            if((potentialCourses[i].lectureSections[k].days[z] == potentialCourses[j].lectureSections[l].tutorialSections[x].days[z]) && (potentialCourses[i].lectureSections[k].days[z] != "-"))
                                            {
                                                if((potentialCourses[i].lectureSections[k].end_time >= potentialCourses[j].lectureSections[l].tutorialSections[x].start_time) && (potentialCourses[i].lectureSections[k].end_time <= potentialCourses[j].lectureSections[l].tutorialSections[x].end_time))
                                                {
                                                    conflictCounterForSections[i][0][k - invalidTermSections]++;
                                                }
                                                if((potentialCourses[j].lectureSections[l].tutorialSections[x].end_time >= potentialCourses[i].lectureSections[k].start_time) && (potentialCourses[j].lectureSections[l].tutorialSections[x].end_time <= potentialCourses[i].lectureSections[k].end_time))
                                                {
                                                    conflictCounterForSections[i][0][k - invalidTermSections]++;
                                                }
                                            }
                                        } 
                                    }
                                }
                            }
                        }
                    }
                }
                
                invalidTermSections = 0;

                if(potentialCourses[j].lectureSections[termCourseSection2].labSections.length > 0)
                {
                    for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                    {
                        if(potentialCourses[i].lectureSections[k].semester != term)
                        {
                            invalidTermSections++;
                        }
                        if(potentialCourses[i].lectureSections[k].semester == term)
                        {
                            for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                            {
                                if(potentialCourses[j].lectureSections[l].semester == term)
                                {
                                    for(x = 0; x < potentialCourses[j].lectureSections[l].labSections.length; x++)
                                    {
                                        for(z = 0; z < 7; z++)
                                        {
                                            if((potentialCourses[i].lectureSections[k].days[z] == potentialCourses[j].lectureSections[l].labSections[x].days[z]) && (potentialCourses[i].lectureSections[k].days[z] != "-"))
                                            {
                                                if((potentialCourses[i].lectureSections[k].end_time >= potentialCourses[j].lectureSections[l].labSections[x].start_time) && (potentialCourses[i].lectureSections[k].end_time <= potentialCourses[j].lectureSections[l].labSections[x].end_time))
                                                {
                                                    conflictCounterForSections[i][0][k - invalidTermSections]++;
                                                }
                                                if((potentialCourses[j].lectureSections[l].labSections[x].end_time >= potentialCourses[i].lectureSections[k].start_time) && (potentialCourses[j].lectureSections[l].labSections[x].end_time <= potentialCourses[i].lectureSections[k].end_time))
                                                {
                                                    conflictCounterForSections[i][0][k - invalidTermSections]++;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                invalidTermSections = 0;
                
                //////////////////////////////////////////////////////////////////////////////////////

                if(potentialCourses[i].lectureSections[termCourseSection1].tutorialSections.length > 0)
                {
                    for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                    {
                        if(potentialCourses[i].lectureSections[k].semester != term)
                        {
                            invalidTermSections++;
                        }
                        if(potentialCourses[i].lectureSections[k].semester == term)
                        {
                            for(x = 0; x < potentialCourses[i].lectureSections[k].tutorialSections.length; x++)
                            {
                                for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                                {
                                    if(potentialCourses[j].lectureSections[l].semester == term)
                                    {
                                        for(z = 0; z < 7; z++)
                                        {
                                            if((potentialCourses[i].lectureSections[k].tutorialSections[x].days[z] == potentialCourses[j].lectureSections[l].days[z])  && (potentialCourses[i].lectureSections[k].tutorialSections[x].days[z] != "-"))
                                            {
                                                if((potentialCourses[i].lectureSections[k].tutorialSections[x].end_time >= potentialCourses[j].lectureSections[l].start_time) && (potentialCourses[i].lectureSections[k].tutorialSections[x].end_time <= potentialCourses[j].lectureSections[l].end_time))
                                                {
                                                    conflictCounterForSections[i][1][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                }
                                                if((potentialCourses[j].lectureSections[l].end_time >= potentialCourses[i].lectureSections[k].tutorialSections[x].start_time) && (potentialCourses[j].lectureSections[l].end_time <= potentialCourses[i].lectureSections[k].tutorialSections[x].end_time))
                                                {
                                                    conflictCounterForSections[i][1][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                invalidTermSections = 0;

                if(potentialCourses[i].lectureSections[termCourseSection1].tutorialSections.length > 0)
                {
                    if(potentialCourses[j].lectureSections[termCourseSection2].tutorialSections.length > 0)
                    {
                        for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                        {
                            if(potentialCourses[i].lectureSections[k].semester != term)
                            {
                                invalidTermSections++;
                            }
                            if(potentialCourses[i].lectureSections[k].semester == term)
                            {
                                for(x = 0; x < potentialCourses[i].lectureSections[k].tutorialSections.length; x++)
                                {
                                    for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                                    {
                                        if(potentialCourses[j].lectureSections[l].semester == term)
                                        {
                                            for(y = 0; y < potentialCourses[j].lectureSections[l].tutorialSections.length; y++)
                                            {
                                                for(z = 0; z < 7; z++)
                                                {
                                                    if((potentialCourses[i].lectureSections[k].tutorialSections[x].days[z] == potentialCourses[j].lectureSections[l].tutorialSections[y].days[z]) && (potentialCourses[i].lectureSections[k].tutorialSections[x].days[z] != "-"))
                                                    {
                                                        if((potentialCourses[i].lectureSections[k].tutorialSections[x].end_time >= potentialCourses[j].lectureSections[l].tutorialSections[y].start_time) && (potentialCourses[i].lectureSections[k].tutorialSections[x].end_time <= potentialCourses[j].lectureSections[l].tutorialSections[y].end_time))
                                                        {
                                                            conflictCounterForSections[i][1][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                        }
                                                        if((potentialCourses[j].lectureSections[l].tutorialSections[y].end_time >= potentialCourses[i].lectureSections[k].tutorialSections[x].start_time) && (potentialCourses[j].lectureSections[l].tutorialSections[y].end_time <= potentialCourses[i].lectureSections[k].tutorialSections[x].end_time))
                                                        {
                                                            conflictCounterForSections[i][1][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                invalidTermSections = 0;
                
                if(potentialCourses[i].lectureSections[termCourseSection1].tutorialSections.length > 0)
                {
                    if(potentialCourses[j].lectureSections[termCourseSection2].labSections.length > 0)
                    {
                        for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                        {
                            if(potentialCourses[i].lectureSections[k].semester != term)
                            {
                                invalidTermSections++;
                            }
                            if(potentialCourses[i].lectureSections[k].semester == term)
                            {
                                for(x = 0; x < potentialCourses[i].lectureSections[k].tutorialSections.length; x++)
                                {
                                    for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                                    {
                                        if(potentialCourses[j].lectureSections[l].semester == term)
                                        {
                                            for(y = 0; y < potentialCourses[j].lectureSections[l].labSections.length; y++)
                                            {
                                                for(z = 0; z < 7; z++)
                                                {
                                                    if((potentialCourses[i].lectureSections[k].tutorialSections[x].days[z] == potentialCourses[j].lectureSections[l].labSections[y].days[z]) && (potentialCourses[i].lectureSections[k].tutorialSections[x].days[z] != "-"))
                                                    {
                                                        if((potentialCourses[i].lectureSections[k].tutorialSections[x].end_time >= potentialCourses[j].lectureSections[l].labSections[y].start_time) && (potentialCourses[i].lectureSections[k].tutorialSections[x].end_time <= potentialCourses[j].lectureSections[l].labSections[y].end_time))
                                                        {
                                                            conflictCounterForSections[i][1][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                        }
                                                        if((potentialCourses[j].lectureSections[l].labSections[y].end_time >= potentialCourses[i].lectureSections[k].tutorialSections[x].start_time) && (potentialCourses[j].lectureSections[l].labSections[y].end_time <= potentialCourses[i].lectureSections[k].tutorialSections[x].end_time))
                                                        {
                                                            conflictCounterForSections[i][1][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                invalidTermSections = 0;
                
                /////////////////////////////////////////////////////////////////////////////////
               
                if(potentialCourses[i].lectureSections[termCourseSection1].labSections.length > 0)
                {
                    for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                    {
                        if(potentialCourses[i].lectureSections[k].semester != term)
                        {
                            invalidTermSections++;
                        }
                        if(potentialCourses[i].lectureSections[k].semester == term)
                        {
                            for(x = 0; x < potentialCourses[i].lectureSections[k].labSections.length; x++)
                            {
                                for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                                {
                                    if(potentialCourses[j].lectureSections[l].semester == term)
                                    {
                                        for(z = 0; z < 7; z++)
                                        {
                                            if((potentialCourses[i].lectureSections[k].labSections[x].days[z] == potentialCourses[j].lectureSections[l].days[z]) && (potentialCourses[i].lectureSections[k].labSections[x].days[z] != "-"))
                                            {
                                                if((potentialCourses[i].lectureSections[k].labSections[x].end_time >= potentialCourses[j].lectureSections[l].start_time) && (potentialCourses[i].lectureSections[k].labSections[x].end_time <= potentialCourses[j].lectureSections[l].end_time))
                                                {
                                                    conflictCounterForSections[i][2][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                }
                                                if((potentialCourses[j].lectureSections[l].end_time >= potentialCourses[i].lectureSections[k].labSections[x].start_time) && (potentialCourses[j].lectureSections[l].end_time <= potentialCourses[i].lectureSections[k].labSections[x].end_time))
                                                {
                                                    conflictCounterForSections[i][2][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                invalidTermSections = 0;
              
                if(potentialCourses[i].lectureSections[termCourseSection1].labSections.length > 0)
                {
                    if(potentialCourses[j].lectureSections[termCourseSection2].tutorialSections.length > 0)
                    {
                        for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                        {
                            if(potentialCourses[i].lectureSections[k].semester != term)
                            {
                                invalidTermSections++;
                            }
                            if(potentialCourses[i].lectureSections[k].semester == term)
                            {
                                for(x = 0; x < potentialCourses[i].lectureSections[k].labSections.length; x++)
                                {
                                    for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                                    {
                                        if(potentialCourses[j].lectureSections[l].semester == term)
                                        {
                                            for(y = 0; y < potentialCourses[j].lectureSections[l].tutorialSections.length; y++)
                                            {
                                               for(z = 0; z < 7; z++)
                                                {
                                                    if((potentialCourses[i].lectureSections[k].labSections[x].days[z] == potentialCourses[j].lectureSections[l].tutorialSections[y].days[z]) && (potentialCourses[i].lectureSections[k].labSections[x].days[z] != "-"))
                                                    {
                                                        if((potentialCourses[i].lectureSections[k].labSections[x].end_time >= potentialCourses[j].lectureSections[l].tutorialSections[y].start_time) && (potentialCourses[i].lectureSections[k].labSections[x].end_time <= potentialCourses[j].lectureSections[l].tutorialSections[y].end_time))
                                                        {
                                                            conflictCounterForSections[i][2][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                        }
                                                        if((potentialCourses[j].lectureSections[l].tutorialSections[y].end_time >= potentialCourses[i].lectureSections[k].labSections[x].start_time) && (potentialCourses[j].lectureSections[l].tutorialSections[y].end_time <= potentialCourses[i].lectureSections[k].labSections[x].end_time))
                                                        {
                                                            conflictCounterForSections[i][2][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                invalidTermSections = 0;

                if(potentialCourses[i].lectureSections[termCourseSection1].labSections.length > 0)
                {
                    if(potentialCourses[j].lectureSections[termCourseSection2].labSections.length > 0)
                    {
                        for(k = 0; k < potentialCourses[i].lectureSections.length; k++)
                        {
                            if(potentialCourses[i].lectureSections[k].semester != term)
                            {
                                invalidTermSections++;
                            }
                            if(potentialCourses[i].lectureSections[k].semester == term)
                            {
                                for(x = 0; x < potentialCourses[i].lectureSections[k].labSections.length; x++)
                                {
                                    for(l = 0; l < potentialCourses[j].lectureSections.length; l++)
                                    {
                                        if(potentialCourses[j].lectureSections[l].semester == term)
                                        {
                                            for(y = 0; y < potentialCourses[j].lectureSections[l].labSections.length; y++)
                                            {
                                                for(z = 0; z < 7; z++)
                                                {
                                                    if((potentialCourses[i].lectureSections[k].labSections[x].days[z] == potentialCourses[j].lectureSections[l].labSections[y].days[z]) && (potentialCourses[i].lectureSections[k].labSections[x].days[z] != "-"))
                                                    {
                                                        if((potentialCourses[i].lectureSections[k].labSections[x].end_time >= potentialCourses[j].lectureSections[l].labSections[y].start_time) && (potentialCourses[i].lectureSections[k].labSections[x].end_time <= potentialCourses[j].lectureSections[l].labSections[y].end_time))
                                                        {
                                                            conflictCounterForSections[i][2][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                        }
                                                        if((potentialCourses[j].lectureSections[l].labSections[y].end_time >= potentialCourses[i].lectureSections[k].labSections[x].start_time) && (potentialCourses[j].lectureSections[l].labSections[y].end_time <= potentialCourses[i].lectureSections[k].labSections[x].end_time))
                                                        {
                                                            conflictCounterForSections[i][2][x + ((k - invalidTermSections) * potentialCourses[i].lectureSections.length)]++;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return conflictCounterForSections;
}

//Takes as parameters the potential course list, the list of conflicts for each section
//and finds the sections with the least conflicts for each course and adds them to an
//empty poential course sections list and then checks for conflictions between courses
//already in the list and tries to replace the sectons that conflict,if a replacement isnt
//found the course is removed from the list of potential cours sections
var selectSections = function(coursesPerSemester, potentialCourses, conflictCounterForSections, potentialCourseSections)
{
    var i;
    var j;
    var k;
    var z;
    var restore;
    var lowestConflicts = 100
    var lowestConflictLectureIndex = 0;
    var lowestConflictTutorialIndex = 0;
    var lowestConflictLabIndex = 0;
    var iterated = 0;
    var removed = 0;
    var restart = true;
    var conflict = false;
    var removeCourse = false;
    
    for (i = 0; i < potentialCourses.length; i++)
    {
        if(potentialCourseSections.length < coursesPerSemester)
        {
            restart = true;
            conflict = false;
            removeCourse = false;

            //document.write(potentialCourses[i].course_number + "<br>");

            lowestConflicts = 100;

            for(j = 0; j < potentialCourses[i].lectureSections.length; j++)
            {
                if(conflictCounterForSections[i][0][j] < lowestConflicts)
                {
                    lowestConflicts = conflictCounterForSections[i][0][j];
                    lowestConflictLectureIndex = j;
                }
            }

            lowestConflicts = 100;

            for(j = 0; j < potentialCourses[i].lectureSections[lowestConflictLectureIndex].tutorialSections.length; j++)
            {
                if(conflictCounterForSections[i][1][j + (lowestConflictLectureIndex * potentialCourses[i].lectureSections.length)] < lowestConflicts)
                {
                    lowestConflicts = conflictCounterForSections[i][1][j];
                    lowestConflictTutorialIndex = j;
                }
            }

            lowestConflicts = 100;

            for(j = 0; j < potentialCourses[i].lectureSections[lowestConflictLectureIndex].labSections.length; j++)
            {
                if(conflictCounterForSections[i][2][j + (lowestConflictTutorialIndex * potentialCourses[i].lectureSections.length)] < lowestConflicts)
                {
                    lowestConflicts = conflictCounterForSections[i][2][j];
                    lowestConflictLabIndex = j;
                }
            }

            /*
            document.write("Lecture Section: " + lowestConflictLectureIndex + "<br>");

            if(potentialCourses[i].lectureSections[lowestConflictLectureIndex].tutorialSections.length > 0)
            {
                document.write("Tutorial Section: " + lowestConflictTutorialIndex + "<br>");
            }
            if(potentialCourses[i].lectureSections[lowestConflictLectureIndex].labSections.length > 0)
            {
                document.write("Lab Section: " + lowestConflictLabIndex + "<br>");
            }
            */

            /////////////////////////////////////////////////////////////////////////////////

            potentialCourseSections.push(JSON.parse(JSON.stringify(potentialCourses[i])));

            /////////////////////////////////////////////////////////////////////////////////

            //document.write(" # of Courses in potential list = " + potentialCourseSections.length + "<br>");
            iterated = 0;
            restore = lowestConflictLectureIndex;

            for(j = 0; j < potentialCourseSections[i - removed].lectureSections.length; j++)
            {
                if(j != lowestConflictLectureIndex)
                {
                    potentialCourseSections[i - removed].lectureSections.splice(j, 1);
                    lowestConflictLectureIndex--;
                    j--;
                }
            }

            lowestConflictLectureIndex = restore;
            restore = lowestConflictTutorialIndex;

            for(j = 0; j < potentialCourseSections[i - removed].lectureSections[0].tutorialSections.length; j++)
            {
                if(j != lowestConflictTutorialIndex)
                {
                    potentialCourseSections[i - removed].lectureSections[0].tutorialSections.splice(j, 1);
                    lowestConflictTutorialIndex--;
                    j--;
                }
            }

            lowestConflictTutorialIndex = restore;
            restore = lowestConflictLabIndex;

            for(j = 0; j < potentialCourseSections[i - removed].lectureSections[0].labSections.length; j++)
            {
                if(j != lowestConflictLabIndex)
                {
                    potentialCourseSections[i - removed].lectureSections[0].labSections.splice(j, 1);
                    lowestConflictLabIndex--;
                    j--;
                }
            }

            lowestConflictLabIndex = restore;

            /////////////////////////////////////////////////////////////////////////////////

            while(restart == true)
            {
                restart = false;

                for(j = 0; j < potentialCourseSections.length; j++)
                {
                    k = potentialCourseSections.length - 1;

                    //document.write("Check conflict " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + " with " + potentialCourseSections[j].course_program.concat(potentialCourseSections[j].course_number) + "<br>");
                    
                    if(potentialCourseSections[j].course_program.concat(potentialCourseSections[j].course_number) != potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number))
                    {
                        /////////////////////////////////////////////////////////////////////////////////
                        
                        //document.write("CHECK 1 <br>");
                        while(true)
                        {
                            for(z = 0; z < 7; z++)
                            {
                                if((potentialCourseSections[j].lectureSections[0].days[z] == potentialCourseSections[k].lectureSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].days[z] != "-"))
                                {
                                    if((potentialCourseSections[j].lectureSections[0].end_time >= potentialCourseSections[k].lectureSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].end_time <= potentialCourseSections[k].lectureSections[0].end_time))
                                    {
                                        //document.write("Lecture - Lecture Conflict <br>");
                                        conflict = true;
                                        break;
                                    }
                                    if((potentialCourseSections[k].lectureSections[0].end_time >= potentialCourseSections[j].lectureSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].end_time <= potentialCourseSections[j].lectureSections[0].end_time))
                                    {
                                        //document.write("Lecture - Lecture Conflict <br>");
                                        conflict = true;
                                        break;
                                    }
                                }
                            }
                            if(iterated == potentialCourses[k + removed].lectureSections.length)
                            {
                                //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                removeCourse = true;
                                break;
                            }
                            if(conflict == true)
                            {
                                //document.write("CHANGE SECTION <br>");
                                restart = true;
                                conflict = false;
                                iterated++;
                                potentialCourseSections[k].lectureSections[0] = JSON.parse(JSON.stringify(potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length]));
                                break;
                            }
                            if(conflict == false)
                            {
                                //document.write("NO Lecture - Lecture Conflict <br>");
                                break;
                            }
                        }
                        if(removeCourse == true)
                        {
                            potentialCourseSections.pop();
                            restart = false;
                            removed++;
                            iterated = 0;
                            break;
                        }
                        if(restart == true)
                        {
                            break;
                        }
                        
                        //document.write("CHECK 2 <br>");
                        if(potentialCourseSections[j].lectureSections[0].tutorialSections.length > 0)
                        {
                            while(true)
                            {
                                for(z = 0; z < 7; z++)
                                {
                                    if((potentialCourseSections[j].lectureSections[0].tutorialSections[0].days[z] == potentialCourseSections[k].lectureSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].tutorialSections[0].days[z] != "-"))
                                    {
                                        if((potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time >= potentialCourseSections[k].lectureSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time <= potentialCourseSections[k].lectureSections[0].end_time))
                                        {
                                            //document.write("Lecture - Tutorial Conflict <br>");
                                            conflict = true;
                                            break;
                                        }
                                        if((potentialCourseSections[k].lectureSections[0].end_time >= potentialCourseSections[j].lectureSections[0].tutorialSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].end_time <= potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time))
                                        {
                                            //document.write("Lecture - Tutorial Conflict <br>");
                                            conflict = true;
                                            break;
                                        }
                                    }
                                }
                                if(iterated == potentialCourses[k + removed].lectureSections.length)
                                {
                                    //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                    removeCourse = true;
                                    break;
                                }
                                if(conflict == true)
                                {
                                    //document.write("CHANGE SECTION <br>");
                                    restart = true;
                                    conflict = false;
                                    iterated++;
                                    potentialCourseSections[k].lectureSections[0] = JSON.parse(JSON.stringify(potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length]));
                                    break;
                                }
                                if(conflict == false)
                                {
                                    //document.write("NO Lecture - Tutorial Conflict <br>");
                                    break;
                                }
                            }
                            if(removeCourse == true)
                            {
                                potentialCourseSections.pop();
                                restart = false;
                                removed++;
                                iterated = 0;
                                break;
                            }
                            if(restart == true)
                            {
                                break;
                            }
                        }
                        
                        //document.write("CHECK 3 <br>");
                        if(potentialCourseSections[j].lectureSections[0].labSections.length > 0)
                        {
                            //document.write("HAS LABS");
                            while(true)
                            {
                                for(z = 0; z < 7; z++)
                                {
                                    if((potentialCourseSections[j].lectureSections[0].labSections[0].days[z] == potentialCourseSections[k].lectureSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].labSections[0].days[z] != "-"))
                                    {
                                        if((potentialCourseSections[j].lectureSections[0].labSections[0].end_time >= potentialCourseSections[k].lectureSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].labSections[0].end_time <= potentialCourseSections[k].lectureSections[0].end_time))
                                        {
                                            //document.write("Lecture - Lab Conflict <br>");
                                            conflict = true;
                                            break;
                                        }
                                        if((potentialCourseSections[k].lectureSections[0].end_time >= potentialCourseSections[j].lectureSections[0].labSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].end_time <= potentialCourseSections[j].lectureSections[0].labSections[0].end_time))
                                        {
                                            //document.write("Lecture - Lab Conflict <br>");
                                            conflict = true;
                                            break;
                                        }
                                    }
                                }
                                if(iterated == potentialCourses[k + removed].lectureSections.length)
                                {
                                    //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                    removeCourse = true;
                                    break;
                                }
                                if(conflict == true)
                                {
                                    //document.write("CHANGE SECTION <br>");
                                    restart = true;
                                    conflict = false;
                                    iterated++;
                                    potentialCourseSections[k].lectureSections[0] = JSON.parse(JSON.stringify(potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length]));
                                    break;
                                }
                                if(conflict == false)
                                {
                                    //document.write("NO Lecture - Lab Conflict <br>");
                                    break;
                                }
                            }
                            if(removeCourse == true)
                            {
                                potentialCourseSections.pop();
                                restart = false;
                                removed++;
                                iterated = 0;
                                break;
                            }
                            if(restart == true)
                            {
                                break;
                            }
                        }

                        /////////////////////////////////////////////////////////////////////////////////
                        
                        //document.write("CHECK 4 <br>");
                        if(potentialCourseSections[k].lectureSections[0].tutorialSections.length > 0)
                        {
                            while(true)
                            {
                                for(z = 0; z < 7; z++)
                                {
                                    if((potentialCourseSections[j].lectureSections[0].days[z] == potentialCourseSections[k].lectureSections[0].tutorialSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].days[z] != "-"))
                                    {
                                        if((potentialCourseSections[j].lectureSections[0].end_time >= potentialCourseSections[k].lectureSections[0].tutorialSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].end_time <= potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time))
                                        {
                                            //document.write("Tutorial - Lecture Conflict <br>");
                                            conflict = true;
                                            break;
                                        }
                                        if((potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time >= potentialCourseSections[j].lectureSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time <= potentialCourseSections[j].lectureSections[0].end_time))
                                        {
                                            //document.write("Tutorial - Lecture Conflict <br>");
                                            conflict = true;
                                            break;
                                        }
                                    }
                                }
                                if(iterated == potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections.length)
                                {
                                    //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                    removeCourse = true;
                                    break;
                                }
                                if(conflict == true)
                                {
                                    //document.write("CHANGE SECTION <br>");
                                    restart = true;
                                    conflict = false;
                                    iterated++;
                                    potentialCourseSections[k].lectureSections[0].tutorialSections[0] = potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections[(lowestConflictTutorialIndex + 1) % potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections.length]
                                    break;
                                }
                                if(conflict == false)
                                {
                                    //document.write("NO Tutorial - Lecture Conflict <br>");
                                    break;
                                }
                            }
                            if(removeCourse == true)
                            {
                                potentialCourseSections.pop();
                                restart = false;
                                removed++;
                                iterated = 0;
                                break;
                            }
                            if(restart == true)
                            {
                                break;
                            }
                        }
                        
                        //document.write("CHECK 5 <br>");
                        if(potentialCourseSections[j].lectureSections[0].tutorialSections.length > 0)
                        {
                            if(potentialCourseSections[k].lectureSections[0].tutorialSections.length > 0)
                            {
                                while(true)
                                {
                                    for(z = 0; z < 7; z++)
                                    {
                                        if((potentialCourseSections[j].lectureSections[0].tutorialSections[0].days[z] == potentialCourseSections[k].lectureSections[0].tutorialSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].tutorialSections[0].days[z] != "-"))
                                        {
                                            if((potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time >= potentialCourseSections[k].lectureSections[0].tutorialSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time <= potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time))
                                            {
                                                //document.write("Tutorial - Tutorial Conflict <br>");
                                                conflict = true;
                                                break;
                                            }
                                            if((potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time >= potentialCourseSections[j].lectureSections[0].tutorialSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time <= potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time))
                                            {
                                                //document.write("Tutorial - Tutorial Conflict <br>");
                                                conflict = true;
                                                break;
                                            }
                                        }
                                    }
                                    if(iterated == potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections.length)
                                    {
                                        //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                        removeCourse = true;
                                        break;
                                    }
                                    if(conflict == true)
                                    {
                                        //document.write("CHANGE SECTION <br>");
                                        restart = true;
                                        conflict = false;
                                        iterated++;
                                        potentialCourseSections[k].lectureSections[0].tutorialSections[0] = potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections[(lowestConflictTutorialIndex + 1) % potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections.length]
                                        break;
                                    }
                                    if(conflict == false)
                                    {
                                        //document.write("NO Tutorial - Tutorial Conflict <br>");
                                        break;
                                    }
                                }
                                if(removeCourse == true)
                                {
                                    potentialCourseSections.pop();
                                    restart = false;
                                    removed++;
                                    iterated = 0;
                                    break;
                                }
                                if(restart == true)
                                {
                                    break;
                                }
                            }
                        }
                        
                        //document.write("CHECK 6 <br>");
                        if(potentialCourseSections[j].lectureSections[0].labSections.length > 0)
                        {
                            if(potentialCourseSections[k].lectureSections[0].tutorialSections.length > 0)
                            {
                                while(true)
                                {
                                    for(z = 0; z < 7; z++)
                                    {
                                        if((potentialCourseSections[j].lectureSections[0].labSections[0].days[z] == potentialCourseSections[k].lectureSections[0].tutorialSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].labSections[0].days[z] != "-"))
                                        {
                                            if((potentialCourseSections[j].lectureSections[0].labSections[0].end_time >= potentialCourseSections[k].lectureSections[0].tutorialSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].labSections[0].end_time <= potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time))
                                            {
                                                //document.write("Tutorial - Lab Conflict <br>");
                                                conflict = true;
                                                break;
                                            }
                                            if((potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time >= potentialCourseSections[j].lectureSections[0].labSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].tutorialSections[0].end_time <= potentialCourseSections[j].lectureSections[0].labSections[0].end_time))
                                            {
                                                //document.write("Tutorial - Lab Conflict <br>");
                                                conflict = true;
                                                break;
                                            }
                                        }
                                    }
                                    if(iterated == potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections.length)
                                    {
                                        //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                        removeCourse = true;
                                        break;
                                    }
                                    if(conflict == true)
                                    {
                                        //document.write("CHANGE SECTION <br>");
                                        restart = true;
                                        conflict = false;
                                        iterated++;
                                        potentialCourseSections[k].lectureSections[0].tutorialSections[0] = potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections[(lowestConflictTutorialIndex + 1) % potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].tutorialSections.length]
                                        break;
                                    }
                                    if(conflict == false)
                                    {
                                        //document.write("NO Tutorial - Lab Conflict <br>");
                                        break;
                                    }

                                }
                                if(removeCourse == true)
                                {
                                    potentialCourseSections.pop();
                                    restart = false;
                                    removed++;
                                    iterated = 0;
                                    break;
                                }
                                if(restart == true)
                                {
                                    break;
                                }
                            }
                        }

                        ///////////////////////////////////////////////////////////////////////////////////
                        
                        //document.write("CHECK 7 <br>");

                        if(potentialCourseSections[k].lectureSections[0].labSections.length > 0)
                        {
                            //document.write(iterated + "<br>");
                            while(true)
                            {
                                for(z = 0; z < 7; z++)
                                {
                                    if((potentialCourseSections[j].lectureSections[0].days[z] == potentialCourseSections[k].lectureSections[0].labSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].days[z] != "-"))
                                    {
                                        if((potentialCourseSections[j].lectureSections[0].end_time >= potentialCourseSections[k].lectureSections[0].labSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].end_time <= potentialCourseSections[k].lectureSections[0].labSections[0].end_time))
                                        {
                                            //document.write("Lab - Lecture Conflict <br>");
                                            conflict = true;
                                            break;
                                        }
                                        if((potentialCourseSections[k].lectureSections[0].labSections[0].end_time >= potentialCourseSections[j].lectureSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].labSections[0].end_time <= potentialCourseSections[j].lectureSections[0].end_time))
                                        {
                                            //document.write("Lab - Lecture <br>");
                                            conflict = true;
                                            break;
                                        }
                                    }
                                }
                                if(iterated == potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections.length)
                                {
                                    //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                    removeCourse = true;
                                    break;
                                }
                                if(conflict == true)
                                {
                                    //document.write("CHANGE SECTION <br>");
                                    restart = true;
                                    conflict = false;
                                    iterated++;
                                    potentialCourseSections[k].lectureSections[0].labSections[0] = potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections[(lowestConflictLabIndex + 1) % potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections.length]
                                    break;
                                }
                                if(conflict == false)
                                {
                                    //document.write("NO Lab - Lecture Conflict <br>");
                                    break;
                                }
                            }
                            if(removeCourse == true)
                            {
                                potentialCourseSections.pop();
                                restart = false;
                                removed++;
                                iterated = 0;
                                break;
                            }
                            if(restart == true)
                            {
                                break;
                            }
                        }

                        //document.write("CHECK 8 <br>");
                        
                        if(potentialCourseSections[j].lectureSections[0].tutorialSections.length > 0)
                        {
                            if(potentialCourseSections[k].lectureSections[0].labSections.length > 0)
                            {
                                while(true)
                                {
                                    for(z = 0; z < 7; z++)
                                    {
                                        if((potentialCourseSections[j].lectureSections[0].tutorialSections[0].days[z] == potentialCourseSections[k].lectureSections[0].labSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].tutorialSections[0].days[z] != "-"))
                                        {
                                            if((potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time >= potentialCourseSections[k].lectureSections[0].labSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time <= potentialCourseSections[k].lectureSections[0].labSections[0].end_time))
                                            {
                                                //document.write("Lab - Tutorial Conflict <br>");
                                                conflict = true;
                                                break;
                                            }
                                            if((potentialCourseSections[k].lectureSections[0].labSections[0].end_time >= potentialCourseSections[j].lectureSections[0].tutorialSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].labSections[0].end_time <= potentialCourseSections[j].lectureSections[0].tutorialSections[0].end_time))
                                            {
                                                //document.write("Lab - Tutorial Conflict <br>");
                                                conflict = true;
                                                break;
                                            }
                                        }
                                    }
                                    if(iterated == potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections.length)
                                    {
                                        //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                        removeCourse = true;
                                        break;
                                    }
                                    if(conflict == true)
                                    {
                                        //document.write("CHANGE SECTION <br>");
                                        restart = true;
                                        conflict = false;
                                        iterated++;
                                        potentialCourseSections[k].lectureSections[0].labSections[0] = potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections[(lowestConflictLabIndex + 1) % potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections.length]
                                        break;
                                    }
                                    if(conflict == false)
                                    {
                                        //document.write("NO Lab - Tutorial Conflict <br>");
                                        break;
                                    }
                                }
                                if(removeCourse == true)
                                {
                                    potentialCourseSections.pop();
                                    restart = false;
                                    removed++;
                                    iterated = 0;
                                    break;
                                }
                                if(restart == true)
                                {
                                    break;
                                }
                            }
                        }

                        //document.write("CHECK 9 <br>");
                        if(potentialCourseSections[j].lectureSections[0].labSections.length > 0)
                        {
                            if(potentialCourseSections[k].lectureSections[0].labSections.length > 0)
                            {
                                while(true)
                                {
                                    for(z = 0; z < 7; z++)
                                    {
                                        if((potentialCourseSections[j].lectureSections[0].labSections[0].days[z] == potentialCourseSections[k].lectureSections[0].labSections[0].days[z]) && (potentialCourseSections[j].lectureSections[0].labSections[0].days[z] != "-"))
                                        {
                                            if((potentialCourseSections[j].lectureSections[0].labSections[0].end_time >= potentialCourseSections[k].lectureSections[0].labSections[0].start_time) && (potentialCourseSections[j].lectureSections[0].labSections[0].end_time <= potentialCourseSections[k].lectureSections[0].labSections[0].end_time))
                                            {
                                                //document.write("Lab - Lab Conflict <br>");
                                                conflict = true;
                                                break;
                                            }
                                            if((potentialCourseSections[k].lectureSections[0].labSections[0].end_time >= potentialCourseSections[j].lectureSections[0].labSections[0].start_time) && (potentialCourseSections[k].lectureSections[0].labSections[0].end_time <= potentialCourseSections[j].lectureSections[0].labSections[0].end_time))
                                            {
                                                //document.write("Lab - Lab Conflict <br>");
                                                conflict = true;
                                                break;
                                            }
                                        }
                                    }
                                    if(iterated == potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections.length)
                                    {
                                        //document.write("REMOVED " + potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + "<br>");
                                        removeCourse = true;
                                        break;
                                    }
                                    if(conflict == true)
                                    {
                                        //document.write("CHANGE SECTION <br>");
                                        restart = true;
                                        conflict = false;
                                        iterated++;
                                        potentialCourseSections[k].lectureSections[0].labSections[0] = potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections[(lowestConflictLabIndex + 1) % potentialCourses[k + removed].lectureSections[(lowestConflictLectureIndex + iterated) % potentialCourses[k + removed].lectureSections.length].labSections.length]
                                        break;
                                    }
                                    if(conflict == false)
                                    {
                                        //document.write("NO Lab - Lab Conflict <br>");
                                        break;
                                    }
                                }
                                if(removeCourse == true)
                                {
                                    potentialCourseSections.pop();
                                    restart = false;
                                    removed++;
                                    iterated = 0;
                                    break;
                                }
                                if(restart == true)
                                {
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            k = potentialCourseSections.length - 1;
            //document.write("<br>");

            if(removeCourse == false)
            {
                //document.write(potentialCourseSections[k].course_program.concat(potentialCourseSections[k].course_number) + " Lecture:");
                //document.write(potentialCourseSections[k].lectureSections[0].section_code + " Tutorial:");

                if(potentialCourseSections[k].lectureSections[0].tutorialSections.length > 0)
                {

                    //document.write(potentialCourseSections[k].lectureSections[0].tutorialSections[0].section_code);
                }
                if(potentialCourseSections[k].lectureSections[0].labSections.length > 0)
                {
                    //document.write(" Lab:" + potentialCourseSections[k].lectureSections[0].labSections[0].section_code);
                }
                //document.write("<br>");
            }
            //document.write("<br>");
        }
    }
    //document.write("<br>");
    return potentialCourseSections;
}

//Takes as parameters the current semester , the number of credits, the type of semester,
//a flag for whether summer was chosen as a preference, the list of online courses, an empty semester schedule list,
//the list of incomplete courses, the list of complete courses, the list of potential courses,
//the list of low priority courses, the list of potential course sections, and the list of conflict counters
//and changes the semester to the next one, adds and removes courses accordingly from the semester list,
//incomplete list and complete list, whilst reseting all the other lists in preparation for the next iteration
var prepNextIteration = function(semesterCounter, term, summer, onlineCourses, semesters, incompleteCourses, completeCourses, potentialCourses, lowPriorityCourses, potentialCourseSections, conflictCounterForSections)
{
    var i;
    var j;
    var semesterArray = [];
    
    while(true)
    {
        if(term == "Fall")
        {
            term = "Winter";
            break;
        }
        if(summer == true)
        {   
            if(term == "Winter")
            {
                term = "Summer";  
                break;
            }
            if(term == "Summer")
            {
                term = "Fall";  
                break;
            }
        }
        if(summer == false)
        {
            if(term == "Winter")
            {
                term = "Fall";  
                break;
            }
        }
    }
    
    for(i = 0; i < potentialCourseSections.length; i++)
    {
        //semesters.push(JSON.parse(JSON.stringify(potentialCourseSections[i])));
        semesterArray.push(JSON.parse(JSON.stringify(potentialCourseSections[i])));
        completeCourses.push(JSON.parse(JSON.stringify(potentialCourseSections[i].course_program.concat(potentialCourseSections[i].course_number))));
        
        for(j = 0; j < incompleteCourses.length; j++)
        {
            if(potentialCourseSections[i].course_program.concat(potentialCourseSections[i].course_number) == incompleteCourses[j].course_program.concat(incompleteCourses[j].course_number))
            {
                incompleteCourses.splice(j, 1);
                break;
            }
        }
    }
    for(i = 0; i < onlineCourses.length; i++)
    {
        semesterArray.push(JSON.parse(JSON.stringify(onlineCourses[i])));
        completeCourses.push(JSON.parse(JSON.stringify(onlineCourses[i].course_program.concat(onlineCourses[i].course_number))));
        for(j = 0; j < incompleteCourses.length; j++)
        {
            if(onlineCourses[i].course_program.concat(onlineCourses[i].course_number) == incompleteCourses[j].course_program.concat(incompleteCourses[j].course_number))
            {
                incompleteCourses.splice(j, 1);
                break;
            }
        }
    }

    semesters[semesterCounter] = semesterArray;

    /*//document.write("Courses taken this semester | ");
    for(i = 0; i < semesters[semesterCounter].length; i++)
    {
        //document.write(semesters[semesterCounter][i].course_program.concat(semesters[semesterCounter][i].course_number) + " ");
    }
    //document.write("<br>");
    
    //document.write("Courses completed so far | ");
    for(i = 0; i < completeCourses.length; i++)
    {
        //document.write(completeCourses[i] + " ");
    }
    //document.write("<br>");
    
    //document.write("Remaining courses required | ");
    for(i = 0; i < incompleteCourses.length; i++)
    {
        //document.write(incompleteCourses[i].course_program.concat(incompleteCourses[i].course_number) + " ");
    }
    //document.write("<br>");
    
    //document.write("Accumulated Credits | ");
    //document.write(credits);
    //document.write("<br>");
    //document.write("<br>");*/
    
    while(onlineCourses.length > 0)
    {
        onlineCourses.pop();
    }
    while(potentialCourses.length > 0)
    {
        potentialCourses.pop();
    }
    while(lowPriorityCourses.length > 0)
    {
        lowPriorityCourses.pop();
    }
    while(potentialCourseSections.length > 0)
    {
        potentialCourseSections.pop();
    }
    while(conflictCounterForSections.length > 0)
    {
        conflictCounterForSections.pop();
    }
    
    var holder = [];
    holder.push(term);
    holder.push(completeCourses);
    holder.push(incompleteCourses);
    holder.push(semesters);
    holder.push(onlineCourses);
    holder.push(lowPriorityCourses);
    holder.push(potentialCourses);
    holder.push(potentialCourseSections);
    holder.push(conflictCounterForSections);
    return holder;
}

function sequencer(semesters)
{
    var i;
    var j;
    var sequence = [];
    var courses = [];
    
    for(i = 0; i < semesters.length; i++)
    {
        sequence.push({"semesterCounter": (i+1)})
       
        if(semesters[i].length > 0)
        {
            sequence.push({"semester": semesters[i][0].lectureSections[0].semester})
        }
        else if((i - 1) > - 1)
        {
            if(semesters[i - 1].length > 0)
            {
                if(semesters[i - 1][0].lectureSections[0].semester == "fall")
                {
                    sequence.push({"semester": "winter"})
                }
                if(semesters[i - 1][0].lectureSections[0].semester == "winter")
                {
                    sequence.push({"semester": "fall"})
                }
            }
        }

        for(j = 0; j < semesters[i].length; j++)
        {      
            courses.push({
                            "course_program": semesters[i][j].course_program,
                            "course_number": semesters[i][j].course_number,
                            "course_name": semesters[i][j].course_name,

                            "course_lecture_section": semesters[i][j].lectureSections[0].section_code,
                            "course_lecture_section_days": semesters[i][j].lectureSections[0].days,
                            "course_lecture_section_start_time": semesters[i][j].lectureSections[0].start_time,
                            "course_lecture_section_end_time": semesters[i][j].lectureSections[0].end_time
                        })
            
            if(semesters[i][j].lectureSections[0].tutorialSections.length > 0)
            {
                courses.push({
                                "course_tutorial_section": semesters[i][j].lectureSections[0].tutorialSections[0].section_code,
                                "course_tutorial_section_days": semesters[i][j].lectureSections[0].tutorialSections[0].days,
                                "course_tutorial_section_start_time": semesters[i][j].lectureSections[0].tutorialSections[0].start_time,
                                "course_tutorial_section_end_time": semesters[i][j].lectureSections[0].tutorialSections[0].end_time,

                               
                            })
            }

            if(semesters[i][j].lectureSections[0].labSections.length > 0)
            {
                courses.push({
                                "course_lab_section": semesters[i][j].lectureSections[0].labSections[0].section_code,
                                "course_lab_section_days": semesters[i][j].lectureSections[0].labSections[0].days,
                                "course_lab_section_start_time": semesters[i][j].lectureSections[0].labSections[0].start_time,
                                "course_lab_section_end_time": semesters[i][j].lectureSections[0].labSections[0].end_time
                            })
            }            
        }
        
        sequence.push({"courses": JSON.parse(JSON.stringify(courses))})
        
        for(j = 0; j < courses.length; j++)
        {
            courses.pop();
            j--;
        }
    }
    
    //document.write(JSON.stringify(sequence));
    //document.write("<br>");
    return sequence;
}


exports.generator= function(term,summerOption,incompleteCourses, completeCourses){

// var term; //STARTING SEMESTER
var summer=(summerOption=='yes')?true:false; //SUMMER OPTION (req.body['summer_opt'] == 'yes') ? true : false;
// var incompleteCourses = incompleteCourses; // INCOMPLETE COURSE LIST SG.parseToJson(req.body["electives"], req.body["completed"]);
// var completeCourses= completeCoursesIDs; // COMPLETE COURSE LIST SG.exportCompletedCourseIDs(req.body["completed"]);
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
    console.log('entering loop');

	potentialCourses = addToPotentialList(term, incompleteCourses, potentialCourses);

	potentialCourses = remove400LevelCourses(potentialCourses, incompleteCourses);

	potentialCourses = removeIncompletePrerequisiteCourses(potentialCourses, completeCourses);


	var holder1 = selectCoursesForSemester(coursesPerSemester, onlineCourses, potentialCourses, lowPriorityCourses);
	console.log("after selectCoursesForSemester:"+potentialCourses.length);
    lowPriorityCourses = holder1[0];
    potentialCourses = holder1[1];
    onlineCourses = holder1[2];


	conflictCounterForSections = initializeConflictCounterForSections(term, potentialCourses);

	conflictCounterForSections = countTimeConflicts(term, potentialCourses, conflictCounterForSections);

	potentialCourseSections = selectSections(coursesPerSemester, potentialCourses, conflictCounterForSections, potentialCourseSections);

	var holder2 = prepNextIteration(semesterCounter, term, summer, onlineCourses, semesters, incompleteCourses, completeCourses, potentialCourses, lowPriorityCourses, potentialCourseSections, conflictCounterForSections);
    
    console.log("run #" + semesterCounter + '\n' + potentialCourses.length);

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
    console.log('exiting loop');
}
return semesters;
}