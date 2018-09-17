/**
 * Created by benja on 7/6/17.
 */

var app = angular.module('myApp', ['ngRoute','ngMaterial']);

// ~~ CONFIGURING ROUTES ~~
app.config(['$routeProvider','$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
       templateUrl : 'login.html'
    });
    $routeProvider.when('/view_courses', {
        templateUrl : 'view_courses.html',
        controller : 'CourseCtrl'
    });
    $routeProvider.when('/view_quizzes', {
        templateUrl : 'view_quizzes.html',
        controller : 'QuizCtrl'
    });
    $routeProvider.when('/view_quiz_contents', {
        templateUrl : 'view_quiz_contents.html',
        controller : 'QuizContentsCtrl'
    }).otherwise({
        redirectTo : 'index.html'
    });
}]);

app.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
}]);

// ~~ DEFINING A SERVICE TO STORE VALUES IN THAT WILL BE ACCESSIBLE GLOBALLY ~~
app.service('Global', function() {
    return {};
});

// ~~ DIRECTIVE TO HANDLE FILE INPUT WHEN SELECTING FILE FOR STUDENT ROSTERS ~~
app.directive('fileReader', function() {
   return {
       scope: {
           fileReader : "="
       },
       link: function(scope, element) {
           $(element).on('change', function(changeEvent) {
               var files = changeEvent.target.files;
               if (files.length) {
                   var reader = new FileReader();
                   reader.onLoad = function(e) {
                       var contents = e.target.result;
                       scope.$apply(function() {
                           scope.fileReader = contents;
                       });
                   };
                   reader.readAsText(files[0]);
               }
           });
       }
   };
});

app.controller('SignUpCtrl', function($scope, $location, $http, $mdDialog, Global) {
    $scope.submitSignUp = function(event) {
        $scope.global = Global;

        // makes sure all fields are filled
        if ($scope.signUpUsername !== undefined && $scope.signUpPassword !== undefined && $scope.confirmPassword !== undefined && $scope.signUpKuId !== undefined) {
            // makes sure passwords match
            if ($scope.signUpPassword === $scope.confirmPassword) {
                try {
                    $http.get('http://66.253.137.68:3000/instructor?username=' + $scope.signUpUsername).then(function(response) {
                        $scope.foundAccount = response.data;
                        // makes sure username isn't already in use by another instructor
                        if ($scope.foundAccount.username === $scope.signUpUsername) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .parent(angular.element(document.querySelector('#popupContainer')))
                                    .clickOutsideToClose(true)
                                    .title('Sign Up Error')
                                    .textContent('Username is already in use.')
                                    .ok('OKAY')
                                    .targetEvent(event)
                            )
                        } else {
                            $scope.global = Global;
                            $http.get('http://66.253.137.68:3000/instructor').then(function(response) {
                               $scope.global.instructors = response.data;

                                $scope.dataObj = ({
                                    username: $scope.signUpUsername,
                                    password: $scope.signUpPassword,
                                    kuID: $scope.signUpKuId,
                                    id: $scope.global.instructors.length
                                });

                                $http.post('http://66.253.137.68:3000/instructor', JSON.stringify($scope.dataObj));
                                localStorage.setItem("instructor", JSON.stringify($scope.dataObj));
                                $scope.global.instructor = JSON.parse(localStorage.getItem("instructor"));
                                $location.path('view_courses');
                            });
                        }
                    });
                } catch (err) {
                    $scope.global = Global;
                    $http.get('http://66.253.137.68:3000/instructor').then(function(response) {
                        $scope.global.instructors = response.data;

                        $scope.dataObj = ({
                            username: $scope.signUpUsername,
                            password: $scope.signUpPassword,
                            kuID: $scope.signUpKuId,
                            id: $scope.global.instructors.length
                        });

                        $http.post('http://66.253.137.68:3000/instructor', JSON.stringify($scope.dataObj));
                        localStorage.setItem("instructor", JSON.stringify($scope.dataObj));
                        $scope.global.instructor = JSON.parse(localStorage.getItem("instructor"));
                        $location.path('view_courses');
                    });
                }
            } else {
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Sign Up Error')
                        .textContent('Passwords must match.')
                        .ok('OKAY')
                        .targetEvent(event)
                )
            }
        } else {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Sign Up Error')
                    .textContent('All fields are required.')
                    .ok('OKAY')
                    .targetEvent(event)
            )
        }
    };
});

app.controller('LoginCtrl', function($scope, $location, $http, $mdDialog, Global) {
    $scope.submitLogin = function(event) {
        $scope.global = Global;

        // makes sure all fields are filled
        if ($scope.loginUsername !== undefined && $scope.loginPassword !== undefined) {
            // checks for account
            try {
                $http.get('http://66.253.137.68:3000/instructor?username=' + $scope.loginUsername + '&password=' + $scope.loginPassword, false).then(function(response) {
                    localStorage.setItem("instructor", JSON.stringify(response.data));
                    $scope.global.instructor = JSON.parse(localStorage.getItem("instructor"));
                    //console.log($scope.global.instructor[0].username);

                    console.log(response.data);

                    // checks for empty return
                    if (response.data.length === 0) {
                        $mdDialog.show(
                            $mdDialog.alert()
                                .parent(angular.element(document.querySelector('#popupContainer')))
                                .clickOutsideToClose(true)
                                .title('Login Error')
                                .textContent('Invalid username or password.')
                                .ok('OKAY')
                                .targetEvent(event)
                        )
                    } else {
                        // bad login
                        if ($scope.global.instructor[0].username !== $scope.loginUsername) {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .parent(angular.element(document.querySelector('#popupContainer')))
                                    .clickOutsideToClose(true)
                                    .title('Login Error')
                                    .textContent('Invalid username or password.')
                                    .ok('OKAY')
                                    .targetEvent(event)
                            )
                            // valid login
                        } else {
                            $location.path("view_courses");
                        }
                    }
                });
            } catch (err) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Login Error')
                        .textContent('Invalid username or password.')
                        .ok('OKAY')
                        .targetEvent(event)
                )
            }
        } else {
            $mdDialog.show(
                $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Login Error')
                    .textContent('All fields are required.')
                    .ok('OKAY')
                    .targetEvent(event)
            )
        }
    }
});

// ~~ VIEW_COURSES CONTROLLER ~~
app.controller('CourseCtrl', function($scope, $http, $location, $mdDialog, Global) {
    $scope.global = Global;
    // RECALLING LOCAL STORAGE ITEMS
    $scope.global.instructor = JSON.parse(localStorage.getItem("instructor"));
    // GETTING COURSE DATA
    $http.get("http://66.253.137.68:3000/course?instructorId=" + $scope.global.instructor[0].instructorId).then(function(response) {
        $scope.global = Global;
        localStorage.setItem("courses", JSON.stringify(response.data));
        $scope.global.courses = JSON.parse(localStorage.getItem("courses"));
    });

    // HANDLING CLICK ON ADD COURSE BUTTON, PRESENTS DIALOG_ADD_COURSE VIEW
    $scope.showAddCourseDialog = function(event) {
        $scope.global = Global;
        $mdDialog.show({
            controller : 'AddCourseCtrl',
            templateUrl : 'dialog_add_course.html',
            parent : angular.element(document.body),
            targetEvent : event,
            clickOutsideToClose : false,
            openFrom : ({
                top:-50,
                width:30,
                height:80
            }),
            closeTo: ({
                left:1500
            })
        })
    };

    // HANDLING CLICK ON DELETE QUESTION, PRESENTS DIALOG_ASK_DELETE_COURSE
    $scope.showAskDeleteCourseDialog = function(index, event) {
        $scope.global = Global;
        localStorage.setItem("currentCourseIndex", String(index));
        $scope.global.currentCourseIndex = localStorage.getItem("currentCourseIndex");
        $mdDialog.show({
            controller : 'AskDeleteCourseCtrl',
            templateUrl : 'dialog_ask_delete_course.html',
            parent : angular.element(document.body),
            targetEvent : event,
            clickOutsideToClose : false,
            openFrom : ({
                top:-50,
                width:30,
                height:80
            }),
            closeTo: ({
                left:1500
            })
        })
    };

    // HANDLING CLICK ON COURSE, PRESENTING VIEW_QUIZ
    $scope.courseClicked = function(index) {
        $scope.global = Global;
        localStorage.setItem("currentCourseIndex", String(index));
        $scope.global.currentCourseIndex = localStorage.getItem("currentCourseIndex");
        localStorage.setItem("currentCourseId", String($scope.global.courses[index].courseId));
        $scope.global.currentCourseId = localStorage.getItem("currentCourseId");
        $location.path("/view_quizzes");
    };

    // HANDLING LOGOUT
    $scope.logout = function() {
        localStorage.clear();
        $location.path("/");
    }
});

// ~~ VIEW_QUIZZES CONTROLLER ~~
app.controller('QuizCtrl', function($scope, $http, $location, $mdDialog, Global) {
    $scope.global = Global;

    // GETTING LOCALLY STORED ITEMS
    $scope.global.instructor = JSON.parse(localStorage.getItem("instructor"));
    $scope.global.currentCourseIndex = localStorage.getItem("currentCourseIndex");
    $scope.global.currentCourseId = localStorage.getItem("currentCourseId");
    $scope.global.courses = JSON.parse(localStorage.getItem("courses"));

    // GETTING QUIZ DATA, FORMATTING BOOLEAN VALUES OF ISVISIBLE VARIABLE FOR CHECKBOXES ON VIEW
    $http.get("http://66.253.137.68:3000/quiz?courseId=" + $scope.global.currentCourseId).then(function(response) {
        $scope.global = Global;
        localStorage.setItem("quizzes", JSON.stringify(response.data));
        $scope.global.quizzes = JSON.parse(localStorage.getItem("quizzes"));
    });

    // GETTING ROSTER DATA
    $http.get("http://66.253.137.68:3000/roster?courseId=" + $scope.global.currentCourseId).then(function(response) {
        $scope.global = Global;
        localStorage.setItem("roster", JSON.stringify(response.data));
        $scope.global.roster = JSON.parse(localStorage.getItem("roster"));
    });

    $scope.fileChanged = function() {
        // define reader
        var reader = new FileReader();

        // A handler for the load event
        reader.onload = function(e) {
            $scope.$apply(function() {
                $scope.csvFile = String(reader.result);
                console.log("CONTENTS OF CSV FILE: " + $scope.csvFile);
                $scope.csvToArray($scope.csvFile);
            });
        };

        // get <input> element and the selected file
        var csvFileInput = document.getElementById('fileInput');
        var csvFile = csvFileInput.files[0];

        // use reader to read the selected file
        // when read operation is successfully finished the load event is triggered
        // and handled by reader.onload function
        reader.readAsText(csvFile);
    };

    $scope.csvToArray = function(csv) {
        console.log("AT CSV TO ARRAY FUNCTION");
        $scope.global = Global;
        $scope.global.rosterUpload = [];
        var lines = csv.split("\n");
        console.log("LINES LENGTH: " + lines.length);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            console.log("LINE: " + line);
            var lineData = line.split(",");
            console.log("CURRENT LINE DATA: " + lineData);

            var kuid = lineData[0];
            console.log("CURRENT KU ID: " + lineData[0]);
            var fname = lineData[1];
            console.log("CURRENT FIRST NAME: " + lineData[1]);
            var lname = lineData[2].replace("\r","");
            console.log("CURRENT LAST NAME: " + lineData[2]);

            $scope.dataObj = ({
                kuID : kuid,
                firstName : fname,
                lastName : lname,
                courseId : $scope.global.currentCourseId
            });

            $scope.global.rosterUpload[i] = $scope.dataObj;
        }

        $scope.uploadRoster();
    };

    $scope.uploadRoster = function() {
        for (var i = 0; i < $scope.global.rosterUpload.length; i++) {
            $http.post("http://66.253.137.68:3000/roster", JSON.stringify($scope.global.rosterUpload[i])).then(function(reponse) {
                $scope.global.roster = $scope.global.rosterUpload;
            });
        }
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Upload Success')
                .textContent('Student roster was successfully uploaded.')
                .ok('OKAY')
                .targetEvent(event)
        )
    };

    // HANDLING CLICK ON ADD QUIZ BUTTON, PRESENTS DIALOG_ADD_QUIZ VIEW
    $scope.showAddQuizDialog = function(event) {
        $scope.global = Global;
        $mdDialog.show({
            controller : 'AddQuizCtrl',
            templateUrl : 'dialog_add_quiz.html',
            parent : angular.element(document.body),
            targetEvent : event,
            clickOutsideToClose : false,
            openFrom : ({
                top:-50,
                width:30,
                height:80
            }),
            closeTo: ({
                left:1500
            })
        })
    };

    $scope.showAskDeleteQuizDialog = function(index, event) {
        $scope.global = Global;
        localStorage.setItem("currentQuizIndex", String(index));
        $scope.global.currentQuizIndex = localStorage.getItem("currentQuizIndex");
        $mdDialog.show({
            controller : 'AskDeleteQuizCtrl',
            templateUrl : 'dialog_ask_delete_quiz.html',
            parent : angular.element(document.body),
            targetEvent : event,
            clickOutsideToClose : false,
            openFrom : ({
                top:-50,
                width:30,
                height:80
            }),
            closeTo: ({
                left:1500
            })
        })
    };

    // HANDLING CLICK ON QUIZ, PRESENTING VIEW_QUIZ_CONTENTS
    $scope.quizClicked = function(index) {
        $scope.global = Global;
        localStorage.setItem("currentQuizIndex", String(index));
        $scope.global.currentQuizIndex = localStorage.getItem("currentQuizIndex");
        localStorage.setItem("currentQuizId", String($scope.global.quizzes[index].quizId));
        $scope.global.currentQuizId = localStorage.getItem("currentQuizId");
        $location.path("/view_quiz_contents");
    };

    // HANDLING CLICK ON MENU BAR COURSES BUTTON
    $scope.navCourses = function() {
        $location.path("/view_courses");
    };

    // HANDLING LOGOUT
    $scope.logout = function() {
        localStorage.clear();
        $location.path("/");
    }
});

// ~~ VIEW_QUIZ_CONTENTS CONTROLLER ~~
app.controller('QuizContentsCtrl', function($scope, $mdDialog, $http, $filter, $location, Global) {
    $scope.global = Global;

    // GETTING LOCALLY STORED ITEMS
    $scope.global.instructor = JSON.parse(localStorage.getItem("instructor"));
    $scope.global.courses = JSON.parse(localStorage.getItem("courses"));
    $scope.global.currentCourseIndex = JSON.parse(localStorage.getItem("currentCourseIndex"));
    $scope.global.quizzes = JSON.parse(localStorage.getItem("quizzes"));
    $scope.global.currentQuizIndex = localStorage.getItem("currentQuizIndex");
    $scope.global.currentQuizId = localStorage.getItem("currentQuizId");

    $http.get("http://66.253.137.68:3000/quiz").then(function(response) {
       $scope.global.temp = response.data;

        /*for (var i = 0; i < $scope.global.temp.length; i++) {
            if ($scope.global.temp[i].quizId === $scope.global.currentQuizId) {
                $scope.global.tempId = i;
            }
        }*/
    });

    $scope.toggleActive = function() {
        var toggle = "";
        if ($scope.global.quizzes[$scope.global.currentQuizIndex].isVisible === "ACTIVE") {
            toggle = "INACTIVE";
        } else {
            toggle = "ACTIVE";
        }

        $scope.dataObj = ({
            title: $scope.global.quizzes[$scope.global.currentQuizIndex].title,
            courseId: $scope.global.courses[$scope.global.currentCourseIndex].courseId,
            sectionId: $scope.global.courses[$scope.global.currentCourseIndex].sectionId,
            dateCreated: $scope.global.quizzes[$scope.global.currentQuizIndex].dateCreated,
            instructions: $scope.global.quizzes[$scope.global.currentQuizIndex].instructions,
            isVisible: toggle,
            instructorId: $scope.global.instructor[0].instructorId,
            quizId: $scope.global.quizzes[$scope.global.currentQuizIndex].quizId,
            id: $scope.global.quizzes[$scope.global.currentQuizIndex].id
        });

        console.log("CURRENT QUIZ ID IS: " + $scope.global.currentQuizId);
        for (var i = 0; i < $scope.global.temp.length; i++) {
            console.log($scope.global.temp[i].quizId);
            if ($scope.global.temp[i].quizId == $scope.global.currentQuizId) {
                $scope.global.tempId = i;
                console.log("RIGHT HERE " + $scope.global.tempId);
            }
        }

        console.log($scope.global.tempId);

        $http.put("http://66.253.137.68:3000/quiz/" + $scope.global.tempId, JSON.stringify($scope.dataObj));

        $scope.global.quizzes[$scope.global.currentQuizIndex].isVisible = toggle;
    };

    // GETTING QUIZ QUESTION DATA
    $http.get("http://66.253.137.68:3000/question?quizId=" + $scope.global.currentQuizId).then(function(response) {
       $scope.global.questions = response.data;
    });

    // GETTING SUBMISSION DATA
    $http.get("http://66.253.137.68:3000/submission?quizId=" + $scope.global.currentQuizId).then(function(response) {
       $scope.global = Global;
       $scope.global.submissions = response.data;

       $scope.global.results = [];

       // populates results array with respect to roster array
       for (var i = 0; i < $scope.global.roster.length; i++) {
           $scope.global.dataObj = {
               kuID : $scope.global.roster[i].kuID,
               correct: 0,
               total: $scope.global.questions.length
           };

           $scope.global.results.push($scope.global.dataObj);
           //$scope.global.results[i].kuID = $scope.global.roster[i].kuID;
           console.log("RESULTS KU ID: " + $scope.global.results[i].kuID);
       }

       // iterates through submissions and adds result parameters to the appropriate kuID
        for (var y = 0; y < $scope.global.submissions.length; y++) {
           for (var j = 0; j < $scope.global.results.length; j++) {
               console.log("SUBMISSION ID AT Y = " + y + ": " + $scope.global.submissions[y].kuID);
               //console.log("RESULT ID AT J = " + j + ": " + $scope.global.result[j].kuID);
               if ($scope.global.submissions[y].kuID === $scope.global.results[j].kuID) {
                   console.log("KU IDS MATCH AT Y VALUE: " + y);
                   if ($scope.global.submissions[y].correct === "YES") {
                       console.log("SUBMISSION IS CORRECT, ADDING CORRECT TO J VALUE: " + j);
                       $scope.global.results[j].correct++;
                   }
                   //$scope.global.results[j].total++;
               }
           }
        }

        for (var z = 0; z < $scope.global.results.length; z++) {
           console.log("STUDENT: " + $scope.global.results[z].kuID + " GOT " + $scope.global.results[z].correct + " OUT OF " + $scope.global.results[z].total);
        }

        // POPULATING INFORMATION FOR STATISTICS TAB
        // getting mean of quiz
        $scope.global.mean = 0;
        for (var i = 0; i < $scope.global.results.length; i++) {
            $scope.global.mean += ($scope.global.results[i].correct / $scope.global.results[i].total);
        }
        $scope.global.mean = ($scope.global.mean / $scope.global.results.length);

        // getting median of quiz
        $scope.global.tempPercentages = [];
        for (var i = 0; i < $scope.global.results.length; i++) {
            $scope.global.tempPercentages[$scope.global.tempPercentages.length] = 0;
            $scope.global.tempPercentages[i] = ($scope.global.results[i].correct / $scope.global.results[i].total);
            console.log("TEMP PERC: " + $scope.global.tempPercentages[i]);
        }
        $scope.global.tempPercentages.sort();
        var half = Math.floor($scope.global.tempPercentages.length / 2);
        if ($scope.global.tempPercentages.length % 2 === 0) {
            console.log("ARRAY IS EVEN");
            $scope.global.median = ($scope.global.tempPercentages[half - 1] + $scope.global.tempPercentages[half]) / 2;
        } else {
            console.log("ARRAY IS ODD");
            $scope.global.median = $scope.global.tempPercentages[half];
        }

        // getting mean and median of each question in quiz
        $scope.global.individualQuestionResults = [];
        for (var i = 0; i < $scope.global.questions.length; i++) {
            $scope.global.dataObj = {
                questionText : $scope.global.question[i].questionText,
                correct: 0,
                mean: 0,
                median: 0,
                total: $scope.global.roster.length
            };
            $scope.global.individualQuestionResults.push($scope.global.dataObj);
        }

        // this will get median of each question in quiz, eventually
        /*for (var i = 0; i < $scope.global.individualQuestionResults.length; i++) {
            for (var j = 0; j < $scope.global.submissions.length; j++) {
                if ($scope.global.individualQuestionResults[i].questionText === $scope.global.submissions[j].questionText) {
                    if ($scope.global.submissions[j].correct == "YES") {
                        $scope.global.individualQuestionResults.correct++;
                    }
                }
            }
        }*/
        
    });

    // HANDLING CLICK ON EXPORT RESULTS BUTTON
    $scope.exportResults = function() {
      var exportData = "";

      for (var i = 0; i < $scope.global.results.length; i++) {
          exportData += ($scope.global.results[i].kuID.toString() + ",");
          exportData += ($scope.global.results[i].correct.toString() + ",");
          exportData += $scope.global.results[i].total.toString();
          if (!(i === ($scope.global.results.length - 1))) {
              exportData += '\n';
          }
      }

      console.log("EXPORT DATA: " + exportData);
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportData));
      element.setAttribute('download', ($scope.global.quizzes[$scope.global.currentQuizIndex].title + " Results.txt"));
      element.click();
    };

    // HANDLING CLICK ON DELETE QUESTION, PRESENTS DIALOG_ASK_DELETE_QUESTION
    $scope.showAskDeleteQuestionDialog = function(index, event) {
        $scope.global = Global;

        $scope.global.currentQuestionIndex = index;
        $mdDialog.show({
            controller : 'AskDeleteQuestionCtrl',
            templateUrl : 'dialog_ask_delete_question.html',
            parent : angular.element(document.body),
            targetEvent : event,
            clickOutsideToClose : false,
            openFrom : ({
                top:-50,
                width:30,
                height:80
            }),
            closeTo: ({
                left:1500
            })
        })
    };

    // HANDLING CLICK ON ADD TRUE/FALSE QUESTION BUTTON, PRESENTS DIALOG_ADD_TRUE_FALSE_QUESTION
    $scope.showAddTFQuestionDialog = function(event) {
        $mdDialog.show({
            controller : 'AddTFQuestionCtrl',
            templateUrl : 'dialog_add_true_false_question.html',
            parent : angular.element(document.body),
            targetEvent : event,
            clickOutsideToClose : false,
            openFrom : ({
                top:-50,
                width:30,
                height:80
            }),
            closeTo: ({
                left:1500
            })
        })
    };

    // HANDLING CLICK ON ADD MULTIPLE CHOICE QUESTION BUTTON, PRESENTS DIALOG_ADD_MULTIPLE_CHOICE_QUESTION
    $scope.showAddMultipleChoiceDialog = function(event) {
        $mdDialog.show({
            controller : 'AddMultipleChoiceCtrl',
            templateUrl : 'dialog_add_multiple_choice_question.html',
            parent : angular.element(document.body),
            targetEvent : event,
            clickOutsideToClose : false,
            openFrom : ({
                top:-50,
                width:30,
                height:80
            }),
            closeTo: ({
                left:1500
            })
        })
    };

    // HANDLING CLICK ON ADD SHORT ANSWER QUESTION BUTTON, PRESENTS DIALOG_ADD_SHORT_ANSWER_QUESTION
    $scope.showAddShortAnswerDialog = function(event) {
        $mdDialog.show({
            controller : 'AddShortAnswerQuestionCtrl',
            templateUrl : 'dialog_add_short_answer_question.html',
            parent : angular.element(document.body),
            targetEvent : event,
            clickOutsideToClose : false,
            openFrom : ({
                top:-50,
                width:30,
                height:80
            }),
            closeTo: ({
                left:1500
            })
        })
    };

    // HANDLING CLICK ON MENU BAR QUIZZES BUTTON
    $scope.navQuizzes = function() {
        $location.path("/view_quizzes");
    };

    // HANDLING CLICK ON MENU BAR COURSES BUTTON
    $scope.navCourses = function() {
        $location.path("/view_courses");
    };

    // HANDLING LOGOUT
    $scope.logout = function() {
        localStorage.clear();
        $location.path("/");
    }
});

// ~~ DIALOG_ADD_COURSE CONTROLLER ~~
app.controller('AddCourseCtrl', function($scope, $mdDialog, $http, Global) {
    $scope.submit = function() {
        $scope.global = Global;

        $http.get("http://66.253.137.68:3000/course").then(function(response) {
            $scope.global = Global;
            $scope.global.allCourses = response.data;
        });

        $scope.global.newCourseId = "";

        for (var i = 1; i <= 16; i++) {
            $scope.global.newCourseId += String(Math.floor((Math.random() * 9) + 1));
        }

        $scope.dataObj = ({
            title: $scope.courseTitle,
            department: $scope.department,
            number: $scope.courseNumber,
            semester: $scope.semester,
            year: $scope.year,
            courseId: $scope.global.newCourseId,
            instructorId: $scope.global.instructor[0].instructorId,
            id: $scope.global.allCourses.length
        });

        $scope.data = JSON.stringify({
            title: $scope.courseTitle,
            department: $scope.department,
            number: $scope.courseNumber,
            semester: $scope.semester,
            year: $scope.year,
            courseId: $scope.global.newCourseId,
            instructorId: $scope.global.instructor[0].instructorId,
            id: $scope.global.allCourses.length
        });

        $http.post("http://66.253.137.68:3000/course", $scope.data);
        $scope.global.courses[$scope.global.courses.length] = $scope.dataObj;
        $scope.cancel();
    };

    $scope.cancel = function() {
       $mdDialog.cancel();
    }
});

app.controller('AddQuizCtrl', function($scope, $mdDialog, $http, Global) {
    $scope.submit = function() {
        $scope.global = Global;

        $http.get("http://66.253.137.68:3000/quiz").then(function(response) {
            $scope.global = Global;
            $scope.global.allQuizzes = response.data;

            $scope.global.newQuizId = "";

            for (var i = 1; i <= 16; i++) {
                $scope.global.newQuizId += String(Math.floor((Math.random() * 9) + 1));
            }

            $scope.today = new Date().toLocaleDateString();

            $scope.dataObj = ({
                title: $scope.quizTitle,
                courseId: $scope.global.courses[$scope.global.currentCourseIndex].courseId,
                sectionId: $scope.global.courses[$scope.global.currentCourseIndex].sectionId,
                dateCreated: $scope.today,
                instructions: $scope.instructions,
                isVisible: $scope.isVisible,
                instructorId: $scope.global.instructor[0].instructorId,
                quizId: $scope.global.newQuizId,
                id: $scope.global.allQuizzes.length
            });

            $scope.data = JSON.stringify({
                title: $scope.quizTitle,
                courseId: $scope.global.courses[$scope.global.currentCourseIndex].courseId,
                sectionId: $scope.global.courses[$scope.global.currentCourseIndex].sectionId,
                dateCreated: $scope.today,
                instructions: $scope.instructions,
                isVisible: $scope.isVisible,
                instructorId: $scope.global.instructor[0].instructorId,
                quizId: $scope.global.newQuizId,
                id: $scope.global.allQuizzes.length
            });

            $http.post("http://66.253.137.68:3000/quiz", $scope.data);
            $scope.global.quizzes[$scope.global.quizzes.length] = $scope.dataObj;
            $scope.cancel();
        });
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
});

// ~~ DIALOG_ASK_DELETE_COURSE CONTROLLER ~~
app.controller('AskDeleteCourseCtrl', function($scope, $mdDialog, $http, $filter, Global) {
    $scope.global = Global;

    $scope.deleteCourse = function() {
        $scope.global = Global;

        console.log("CURRENT SELECTED INDEX IS: " + $scope.global.currentCourseIndex);

        $http.get("http://66.253.137.68:3000/course").then(function(response) {
           $scope.global.temp = response.data;

           for (var i = 0; i < $scope.global.temp.length; i++) {
               if ($scope.global.temp[i].courseId === $scope.global.courses[$scope.global.currentCourseIndex].courseId) {
                   $scope.global.tempId = i;
               }
           }

           $scope.global.temp.splice($scope.global.tempId, 1);
           $scope.global.courses.splice($scope.global.currentCourseIndex, 1);

           for (var i = 0; i < $scope.global.temp.length; i++) {
                $scope.newDataObj = ({
                    title: $scope.global.temp[i].title,
                    department: $scope.global.temp[i].department,
                    number: $scope.global.temp[i].number,
                    semester: $scope.global.temp[i].semester,
                    year: $scope.global.temp[i].year,
                    courseId: $scope.global.temp[i].courseId,
                    instructorId: $scope.global.temp[i].instructorId,
                    id: i
                });

                $http.put("http://66.253.137.68:3000/course/" + i, JSON.stringify($scope.newDataObj));
                console.log("JUST PUT AT: " + i);
           }

           $http.delete("http://66.253.137.68:3000/course/" + $scope.global.temp.length);

           $scope.cancel();
        });

        // CURRENTLY "WORKS"
        /*var filteredCourses = $filter('filter')($scope.global.courses, {instructorId : $scope.global.instructor[0].id});

        var filteredId = filteredCourses[$scope.global.currentCourseIndex].id;
        console.log('FILTERED ID: ' + filteredId);

        $scope.global.courses.splice(filteredId, 1);

        for (var i = 0; i < $scope.global.courses.length; i++) {
            $scope.newDataObj = ({
                title: $scope.global.courses[i].title,
                department: $scope.global.courses[i].department,
                number: $scope.global.courses[i].number,
                semester: $scope.global.courses[i].semester,
                year: $scope.global.courses[i].year,
                instructorId: $scope.global.courses[i].instructorId,
                id: i
            });

            $http.put("http://66.253.137.75:3000/course/" + i, JSON.stringify($scope.newDataObj));
            console.log("JUST PUT AT: " + i);
        }

        $http.delete("http://66.253.137.75:3000/course/" + $scope.global.courses.length).then(function successCallBack(response) {
            console.log("JUST DELETE AT: " + $scope.global.courses.length);
        }, function errorCallback(response) {
            $http.delete("http://66.253.137.75:3000/course/" + ($scope.global.courses.length - 1));
            console.log("JUST DELETE AT: " + $scope.global.courses.length - 1);
        });

        $scope.cancel();*/
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
});

// ~~ DIALOG_ASK_DELETE_QUIZ CONTROLLER ~~
app.controller('AskDeleteQuizCtrl', function($scope, $mdDialog, $http, $filter, Global) {
    $scope.global = Global;

    $scope.deleteQuiz = function(index) {
        $scope.global = Global;

        $http.get("http://66.253.137.68:3000/quiz").then(function(response) {
            $scope.global.temp = response.data;

            for (var i = 0; i < $scope.global.temp.length; i++) {
                if ($scope.global.temp[i].quizId === $scope.global.quizzes[$scope.global.currentQuizIndex].quizId) {
                    $scope.global.tempId = i;
                }
            }

            $scope.global.temp.splice($scope.global.tempId, 1);
            $scope.global.quizzes.splice($scope.global.currentQuizIndex, 1);

            for (var i = 0; i < $scope.global.temp.length; i++) {
                $scope.newDataObj = ({
                    title: $scope.global.temp[i].title,
                    courseId: $scope.global.temp[i].courseId,
                    dateCreated: $scope.global.temp[i].dateCreated,
                    instructions: $scope.global.temp[i].instructions,
                    isVisible: $scope.global.temp[i].isVisible,
                    quizId: $scope.global.temp[i].quizId,
                    instructorId: $scope.global.temp[i].instructorId,
                    id: i
                });

                $http.put("http://66.253.137.68:3000/quiz/" + i, JSON.stringify($scope.newDataObj));
                console.log("JUST PUT AT: " + i);
            }

            $http.delete("http://66.253.137.68:3000/quiz/" + $scope.global.temp.length);

            $scope.cancel();
        });
        /*$scope.global = Global;

        var filteredQuizzes = $filter('filter')($scope.global.quizzes, {courseId : $scope.global.currentCourseIndex, instructorId : $scope.global.instructor[0].id});

        var filteredId = filteredQuizzes[$scope.global.currentQuizIndex].id;
        console.log('FILTERED ID: ' + filteredId);

        $scope.global.quizzes.splice(filteredId, 1);

        for (var i = 0; i < $scope.global.quizzes.length; i++) {

            $scope.newDataObj = ({
                title: $scope.global.quizzes[i].type,
                courseId: $scope.global.quizzes[i].courseId,
                sectionId: $scope.global.quizzes[i].sectionId,
                dateCreated: $scope.global.quizzes[i].dateCreated,
                instructions: $scope.global.quizzes[i].instructions,
                isVisible: $scope.global.quizzes[i].isVisible,
                instructorId: $scope.global.quizzes[i].instructorId,
                id: i
            });

            $http.put("http://66.253.137.201:3000/quiz/" + i, JSON.stringify($scope.newDataObj));
            console.log("JUST PUT AT: " + i);
        }

        $http.delete("http://66.253.137.201:3000/quiz/" + $scope.global.quizzes.length).then(function successCallBack(response) {
            console.log("JUST DELETE AT: " + $scope.global.quizzes.length);
        }, function errorCallback(response) {
            $http.delete("http://66.253.137.201:3000/quiz/" + ($scope.global.quizzes.length - 1));
            console.log("JUST DELETE AT: " + $scope.global.quizzes.length - 1);
        });

        $scope.cancel();*/
    };

    $scope.cancel = function() {
        $mdDialog.cancel();

        console.log("FINISHED\n\n")
    }
});

// ~~ DIALOG_ASK_DELETE_QUESTION CONTROLLER ~~
app.controller('AskDeleteQuestionCtrl', function($scope, $mdDialog, $http, $filter, Global) {
    $scope.global = Global;

    $scope.deleteQuestion = function(index) {
        $scope.global = Global;

        $http.get("http://66.253.137.68:3000/question").then(function(response) {
            $scope.global.temp = response.data;

            for (var i = 0; i < $scope.global.temp.length; i++) {
                if ($scope.global.temp[i].questionId === $scope.global.questions[$scope.global.currentQuestionIndex].questionId) {
                    $scope.global.tempId = i;
                }
            }

            $scope.global.temp.splice($scope.global.tempId, 1);
            $scope.global.questions.splice($scope.global.currentQuestionIndex, 1);

            for (var i = 0; i < $scope.global.temp.length; i++) {
                $scope.newDataObj = ({
                    type: $scope.global.temp[i].type,
                    quizId: $scope.global.temp[i].quizId,
                    courseId: $scope.global.temp[i].courseId,
                    questionText: $scope.global.temp[i].questionText,
                    option1: $scope.global.temp[i].option1,
                    option2: $scope.global.temp[i].option2,
                    option3: $scope.global.temp[i].option3,
                    option4: $scope.global.temp[i].option4,
                    answer: $scope.global.temp[i].answer,
                    instructorId: $scope.global.temp[i].instructorId,
                    id: i
                });

                $http.put("http://66.253.137.68:3000/question/" + i, JSON.stringify($scope.newDataObj));
                console.log("JUST PUT AT: " + i);
            }

            $http.delete("http://66.253.137.68:3000/question/" + $scope.global.temp.length);

            $scope.cancel();
        });

        /*var filteredQuestions = $filter('filter')($scope.global.questions, {courseId : $scope.global.currentCourseIndex, instructorId : $scope.global.instructor[0].id});

        var filteredId = filteredQuestions[$scope.global.currentQuestionIndex].id;
        console.log('FILTERED ID: ' + filteredId);

        $scope.global.questions.splice(filteredId, 1);

        for (var i = 0; i < $scope.global.questions.length; i++) {

            $scope.newDataObj = ({
                type: $scope.global.questions[i].type,
                quizId: $scope.global.questions[i].quizId,
                courseId: $scope.global.questions[i].courseId,
                questionText: $scope.global.questions[i].questionText,
                option1: $scope.global.questions[i].option1,
                option2: $scope.global.questions[i].option2,
                option3: $scope.global.questions[i].option3,
                option4: $scope.global.questions[i].option4,
                answer: $scope.global.questions[i].answer,
                instructorId: $scope.global.questions[i].instructorId,
                id: i
            });

            $http.put("http://66.253.137.201:3000/question/" + i, JSON.stringify($scope.newDataObj));
            console.log("JUST PUT AT: " + i);
        }

        $http.delete("http://66.253.137.201:3000/question/" + $scope.global.questions.length).then(function successCallBack(response) {
            console.log("JUST DELETE AT: " + $scope.global.questions.length);
        }, function errorCallback(response) {
            $http.delete("http://66.253.137.201:3000/question/" + ($scope.global.questions.length - 1));
            console.log("JUST DELETE AT: " + $scope.global.questions.length - 1);
        });

        $scope.cancel();*/
    };

    $scope.cancel = function() {
        $mdDialog.cancel();

        console.log("FINISHED\n\n")
    }
});

// ~~ DIALOG_ADD_TRUE_FALSE_QUESTION CONTROLLER ~~
app.controller('AddTFQuestionCtrl', function($scope, $mdDialog, $http, Global) {
    $scope.global = Global;

    $http.get("http://66.253.137.68:3000/question").then(function(response) {
        $scope.global = Global;
        $scope.global.temp = response.data;
    });

    $scope.global.newQuestionId = "";

    for (var i = 1; i <= 16; i++) {
        $scope.global.newQuestionId += String(Math.floor((Math.random() * 9) + 1));
    }

    // HANDLING CLICK ON SUBMIT BUTTON, GETS INPUT DATA, POSTS TO DATABASE, UPDATES LOCAL ARRAY OF DATA
    $scope.submit = function() {
        $scope.global = Global;

        console.log("CURRENT QUESTIONS LENGTH: " + $scope.global.questions.length);

        $scope.dataObj = ({
            type: "TF",
            quizId: $scope.global.currentQuizId,
            courseId: $scope.global.currentCourseId,
            questionText: $scope.questionText,
            answer: $scope.answer,
            instructorId: $scope.global.instructor[0].instructorId,
            questionId: $scope.global.newQuestionId,
            id: $scope.global.temp.length
        });

        $scope.data = JSON.stringify({
            type: "TF",
            quizId: $scope.global.currentQuizId,
            courseId: $scope.global.currentCourseId,
            questionText: $scope.questionText,
            answer: $scope.answer,
            instructorId: $scope.global.instructor[0].instructorId,
            questionId: $scope.global.newQuestionId,
            id: $scope.global.temp.length
        });

      $http.post("http://66.253.137.68:3000/question", $scope.data);
      $scope.global.questions[$scope.global.questions.length] = $scope.dataObj;
      $scope.cancel();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
});

// ~~ DIALOG_ADD_MULTIPLE_CHOICE_QUESTION CONTROLLER ~~
app.controller('AddMultipleChoiceCtrl', function($scope, $mdDialog, $http, Global) {
    $scope.global = Global;

    $http.get("http://66.253.137.68:3000/question").then(function(response) {
        $scope.global = Global;
        $scope.global.temp = response.data;
    });

    $scope.global.newQuestionId = "";

    for (var i = 1; i <= 16; i++) {
        $scope.global.newQuestionId += String(Math.floor((Math.random() * 9) + 1));
    }

    $scope.submit = function() {
        $scope.dataObj = ({
            type: "Multiple",
            quizId: $scope.global.currentQuizId,
            courseId: $scope.global.currentCourseId,
            questionText: $scope.questionText,
            instructorId: $scope.global.instructor[0].instructorId,
            questionId: $scope.global.newQuestionId,
            id: $scope.global.temp.length
        });

        $scope.data = JSON.stringify({
            type: "Multiple",
            quizId: $scope.global.currentQuizId,
            courseId: $scope.global.currentCourseId,
            questionText: $scope.questionText,
            option1: $scope.option1,
            option2: $scope.option2,
            option3: $scope.option3,
            option4: $scope.option4,
            answer: $scope.answer,
            instructorId: $scope.global.instructor[0].instructorId,
            questionId: $scope.global.newQuestionId,
            id: $scope.global.temp.length
        });

        $http.post("http://66.253.137.68:3000/question", $scope.data);
        $scope.global.questions[$scope.global.questions.length] = $scope.dataObj;
        $scope.cancel();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
});

// ~~ DIALOG_ADD_SHORT_ANSWER_QUESTION_CONTROLLER ~~
app.controller('AddShortAnswerQuestionCtrl', function($scope, $mdDialog, $http, Global) {
    $scope.global = Global;

    $http.get("http://66.253.137.68:3000/question").then(function(response) {
        $scope.global = Global;
        $scope.global.temp = response.data;
    });

    $scope.global.newQuestionId = "";

    for (var i = 1; i <= 16; i++) {
        $scope.global.newQuestionId += String(Math.floor((Math.random() * 9) + 1));
    }

    // HANDLING CHANGE OF ANSWER TYPE
    $scope.typeChanged = function() {
      if ($scope.answerType == "text") {
          $scope.isText = true;
          $scope.isNumber = false;
      } else {
          $scope.isNumber = true;
          $scope.isText = false;
      }
    };

    // HANDLING CLICK ON SUBMIT BUTTON, GETS INPUT DATA, POSTS TO DATABASE, UPDATES LOCAL ARRAY OF DATA
    $scope.submit = function() {
        $scope.global = Global;

        $scope.dataObj = ({
            type: "ShortAnswer",
            quizId: $scope.global.currentQuizIndex,
            courseId: $scope.global.currentCourseIndex,
            questionText: $scope.questionText,
            instructorId: $scope.global.instructor[0].instructorId,
            questionId: $scope.global.newQuestionId,
            answerType: $scope.answerType,
            answer: $scope.answer,
            rangeLower: $scope.rangeLower,
            rangeUpper: $scope.rangeUpper,
            id: $scope.global.temp.length
        });

        $scope.data = JSON.stringify({
            type: "ShortAnswer",
            quizId: $scope.global.currentQuizId,
            courseId: $scope.global.currentCourseId,
            questionText: $scope.questionText,
            instructorId: $scope.global.instructor[0].instructorId,
            questionId: $scope.global.newQuestionId,
            answerType: $scope.answerType,
            answer: $scope.answer,
            rangeLower: $scope.rangeLower,
            rangeUpper: $scope.rangeUpper,
            id: $scope.global.temp.length
        });

        $http.post("http://66.253.137.68:3000/question", $scope.data);
        $scope.global.questions[$scope.global.questions.length] = $scope.dataObj;
        $scope.cancel();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    }
});