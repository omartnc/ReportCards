const csv = require('csv-parser');
const fs = require('fs');

let marksDataList = [];
fs.createReadStream('marks.csv')
    .pipe(csv())
    .on('data', (row) => {
        marksDataList.push(row);
    })
    .on('end', () => {
        //console.log(marksDataList);
    });


let coursesDataList = [];
fs.createReadStream('courses.csv')
    .pipe(csv())
    .on('data', (row) => {
        coursesDataList.push(row);
    })
    .on('end', () => {
        //console.log(coursesDataList);
    });



let testsDataList = [];
fs.createReadStream('tests.csv')
    .pipe(csv())
    .on('data', (row) => {
        testsDataList.push(row);
    })
    .on('end', () => {
        //console.log(testsDataList);
    });

let aoutputJson = {
    students: []
};
let studentsDataList = [];
fs.createReadStream('students.csv')
    .pipe(csv())
    .on('data', (row) => {
        studentsDataList.push(row);
    })
    .on('end', () => { 

        studentsDataList.forEach(student => {
            let studentNew = {};
            let studentNewCourses = [];


            coursesDataList.forEach(course => {
                let courseTotalAvarage = 0;
                let testsDataListFiltered = testsDataList.filter(x => x.course_id == course.id);
                testsDataListFiltered.forEach(test => {
                    let markTotalAvarage = 0;
                    let markListFiltered = marksDataList.filter(x => x.student_id == student.id && x.test_id == test.id);
                    if (markListFiltered.length == 0)
                        return;
                    markListFiltered.forEach(mark => {
                        markTotalAvarage += mark.mark;
                    });
                    courseTotalAvarage += (((markTotalAvarage / markListFiltered.length) * test.weight) / 100);
                });
                let courseNew = {
                    "id": course.id,
                    "name": course.name,
                    "teacher": course.teacher,
                    "courseAverage": courseTotalAvarage.toFixed(2)
                };
                if (courseTotalAvarage != 0)
                    studentNewCourses.push(courseNew);
            });


            studentNew.id = student.id;
            studentNew.name = student.name;
            studentNew.totalAverage = ((studentNewCourses.reduce((x, y) => x + Number.parseFloat(y.courseAverage), 0)) / studentNewCourses.length).toFixed(2);
            studentNew.courses = studentNewCourses;
            aoutputJson.students.push(studentNew);
        });

        fs.writeFileSync('outputTest.json', JSON.stringify(aoutputJson));

    });
