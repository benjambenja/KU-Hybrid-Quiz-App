using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Net.Http;

using System.Diagnostics;

using Xamarin.Forms;


namespace KUHybridQuizApp
{
    public partial class ViewQuiz : ContentPage
    {
        public ViewQuiz(string quizName, string quizId, string courseId, string courseName)
        {
            InitializeComponent();

            // setting title of page
            this.Title = quizName;

			// setting quizId to be used for updating quiz visiblilty
			Global.quizId = quizId;

			// calling function to obtain questions, casts to list
            GetData();

            // assigning value to overall count of submissions after retrieving all submissions
            Global.overallCount = Global.submissions.Count + 1;

            // removing questions that are not for this quiz
            for (int i = 0; i < Global.questions.Count; i++) {
                Debug.WriteLine(Global.questions[i].questionText);
                if (Global.questions[i].quizId != quizId)
				{
                    Global.questions.RemoveAt(i);
				}   
            }

            // creating seperate lists for each listview
            for (int i = 0; i < Global.questions.Count; i++) {
                if (Global.questions[i].type == "TF") {
                    Global.TFQuestions.Add(Global.questions[i]);
                } else if (Global.questions[i].type == "Multiple") {
                    Global.MultipleQuestions.Add(Global.questions[i]);
                } else if (Global.questions[i].type == "ShortAnswer") {
                    Global.ShortAnswerQuestions.Add(Global.questions[i]);
                }
            }

            // creating lists of options for true false questions
            for (int i = 0; i < Global.TFQuestions.Count; i++) {
                Global.TFQuestions[i].optionList = new List<String>();
                Global.TFQuestions[i].optionList.Add("True");
                Global.TFQuestions[i].optionList.Add("False");
            }

			// creating lists of options for multiple choice questions
            for (int i = 0; i < Global.MultipleQuestions.Count; i++) {
                Global.MultipleQuestions[i].optionList = new List<String>();
                Global.MultipleQuestions[i].optionList.Add(Global.MultipleQuestions[i].option1);
                Global.MultipleQuestions[i].optionList.Add(Global.MultipleQuestions[i].option2);
                Global.MultipleQuestions[i].optionList.Add(Global.MultipleQuestions[i].option3);
                Global.MultipleQuestions[i].optionList.Add(Global.MultipleQuestions[i].option4);
            }

            // populating list that will be uploaded as submissions with empty submissions
            for (int i = 0; i < Global.questions.Count; i++) {
				Submission finishedQuestion = new Submission()
				{
					kuID = Info.KUID,
					//questionId = Global.questions[Global.currentIndex].id,
					quizId = Global.questions[0].quizId,
					courseId = Info.currentCourseId,
					instructorId = Info.instructorId,
					answer = null,
					correct = null,
                    //id = i.ToString()
				};

                Global.answeredQuestions.Insert(i, finishedQuestion);
            }

            // setting items sources for listviews
            TFQuestionList.ItemsSource = Global.TFQuestions;
            MultipleQuestionList.ItemsSource = Global.MultipleQuestions;
            ShortAnswerQuestionList.ItemsSource = Global.ShortAnswerQuestions;

            // setting courseId to be used for submissions
            Global.courseId = courseId;

            // setting courseName to be used for dismissing quiz window
            Global.courseName = courseName;
        }

		// class to hold array of question objects and Submission objects so that it can be manipulated throughout page
		public static class Global
		{
            public static List<Question> questions = new List<Question>();
            public static List<Question> TFQuestions = new List<Question>();
            public static List<Question> MultipleQuestions = new List<Question>();
            public static List<Question> ShortAnswerQuestions = new List<Question>();
            public static List<Submission> submissions = new List<Submission>();
            public static List<Submission> answeredQuestions = new List<Submission>();
            public static int currentIndex = 0;
            public static string courseId;
            public static string courseName;
            public static int overallCount = 0;
            public static string quizId;
            public static string isCorrect;
		}

		// creating question class to later make an array of Question objects, filling these member
		// variables with data from db.json
		public class Question
		{
			public string type { get; set; }
            public string quizId { get; set; }
            public string courseId { get; set; }
			public string questionText { get; set; }
            public string isTF { get; set; }
            public string isMultiple { get; set; }
            public string option1 { get; set; }
            public string option2 { get; set; }
            public string option3 { get; set; }
            public string option4 { get; set; }
            public List<String> optionList { get; set; }
            public string answer { get; set; }
            public string answerType { get; set; }
            public string rangeLower { get; set; }
            public string rangeUpper { get; set; }
            public string instructorId { get; set; }
			public string id { get; set; }
		}

        // creating submissions class in order to store the answers given by student and later append to json file
        // and update json file on database
        public class Submission
        {
            public string kuID { get; set; }
            public string quizId { get; set; }
            public string courseId { get; set; }
            public string instructorId { get; set; }
            public string answer { get; set; }
            public string correct { get; set; }
            public string id { get; set; }
        }

		// creating quiz class to later make an array of Quiz objects, filling these member
		// variables with data from db.json
		public class Quiz
		{
			public string title { get; set; }
			public string courseId { get; set; }
			public string dateCreated { get; set; }
			public string instructions { get; set; }
			public string isVisible { get; set; }
            public string instructorId { get; set; }
			public string id { get; set; }
		}

		// retreiving json file, parsing it, and returning it as a list of RootObject
		public static void GetData()
		{
			// url of db.json file
            var dbPath = new Uri(Info.IP + "/question?quizId=" + Global.quizId);
			// creating http client
			HttpClient client = new HttpClient();
			// reading json file from url as string
			var content = client.GetStringAsync(dbPath);
			// parsing string as list of RootObject
            Global.questions = JsonConvert.DeserializeObject<List<Question>>(content.Result);

            dbPath = new Uri(Info.IP + "/submission");
            content = client.GetStringAsync(dbPath);
            Global.submissions = JsonConvert.DeserializeObject<List<Submission>>(content.Result);
		}
	
        // handling selection on true false questions
        private void TFPicker_SelectedIndexChanged(object sender, System.EventArgs e)
        {
            Debug.WriteLine("CODE IS HANDLING SELECTED INDEX CHANGED IN TF PICKER");
            var picker = (Picker)sender;
            var selectedIndex = picker.SelectedIndex;
            var selectedAnswer = "";
            var foundIndex = 0;

            if (selectedIndex == 0) {
                selectedAnswer = "true";
            } else {
                selectedAnswer = "false";
            }
            Debug.WriteLine(picker.ClassId);
            Debug.WriteLine(selectedAnswer);

            // getting index of question being answered
            for (int i = 0; i < Global.questions.Count; i++) {
                if (picker.ClassId == Global.questions[i].questionText) {
                    foundIndex = i;
                }
            }

            // determining if correct answer
            if (selectedAnswer.ToLower() == Global.questions[foundIndex].answer) {
                Global.isCorrect = "YES";
            } else {
                Global.isCorrect = "NO";
            }

			// updating submission values
			Submission finishedQuestion = new Submission()
			{
				kuID = Info.KUID,
				//questionId = Global.questions[Global.currentIndex].id,
                quizId = Global.questions[foundIndex].quizId,
				courseId = Global.courseId,
				instructorId = Info.instructorId,
                answer = selectedAnswer.ToLower(),
				correct = Global.isCorrect,
                //id = foundIndex.ToString()
			};

            // inserting submission
            Global.answeredQuestions[foundIndex] = finishedQuestion;

            Debug.WriteLine(Global.answeredQuestions[foundIndex].kuID);
            Debug.WriteLine(Global.answeredQuestions[foundIndex].quizId);
            Debug.WriteLine(Global.answeredQuestions[foundIndex].courseId);
            Debug.WriteLine(Global.answeredQuestions[foundIndex].instructorId);
            Debug.WriteLine(Global.answeredQuestions[foundIndex].answer);
            Debug.WriteLine(Global.answeredQuestions[foundIndex].correct);
            Debug.WriteLine(Global.answeredQuestions[foundIndex].id);
        }

        void MultiplePickerChanged_SelectedIndexChanged(object sender, System.EventArgs e)
        {
			var picker = (Picker)sender;
			var selectedIndex = picker.SelectedIndex;
			var selectedAnswer = "";
			var foundIndex = 0;

            if (selectedIndex == 0) {
                selectedAnswer = "option1";
            } else if (selectedIndex == 1) {
                selectedAnswer = "option2";
			} else if (selectedIndex == 2)
			{
				selectedAnswer = "option3";
			} else if (selectedIndex == 3)
			{
				selectedAnswer = "option4";
			}
			Debug.WriteLine(picker.ClassId);
			Debug.WriteLine(selectedAnswer);

			// getting index of question being answered
			for (int i = 0; i < Global.questions.Count; i++)
			{
				if (picker.ClassId == Global.questions[i].questionText)
				{
					foundIndex = i;
				}
			}

			// determining if correct answer
			if (selectedAnswer == Global.questions[foundIndex].answer)
			{
				Global.isCorrect = "YES";
			}
			else
			{
				Global.isCorrect = "NO";
			}

			// updating submission values
			Submission finishedQuestion = new Submission()
			{
				kuID = Info.KUID,
				//questionId = Global.questions[Global.currentIndex].id,
				quizId = Global.questions[foundIndex].quizId,
				courseId = Global.courseId,
				instructorId = Info.instructorId,
				answer = selectedAnswer.ToLower(),
				correct = Global.isCorrect,
				//id = foundIndex.ToString()
			};

			// inserting submission
			Global.answeredQuestions[foundIndex] = finishedQuestion;

			Debug.WriteLine(Global.answeredQuestions[foundIndex].kuID);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].quizId);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].courseId);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].instructorId);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].answer);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].correct);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].id);
        }

        // handles entry text changing on short answer questions
        void Entry_TextChanged(object sender, Xamarin.Forms.TextChangedEventArgs e)
        {
			var entry = (Entry)sender;

			var selectedAnswer = "";
			var foundIndex = 0;

            selectedAnswer = entry.Text;

            Debug.WriteLine(entry.ClassId);
			Debug.WriteLine(selectedAnswer);

			// getting index of question being answered
			for (int i = 0; i < Global.questions.Count; i++)
			{
                if (entry.ClassId == Global.questions[i].questionText)
				{
					foundIndex = i;
				}
			}

            // determining if correct answer
            if (Global.questions[foundIndex].answerType == "text") {
                if (selectedAnswer == Global.questions[foundIndex].answer)
                {
                    Global.isCorrect = "YES";
				} else {
					Global.isCorrect = "NO";
				}
			}
			else
			{
				if (Convert.ToInt32(selectedAnswer) >= Convert.ToInt32(Global.questions[foundIndex].rangeLower)
				&& Convert.ToInt32(selectedAnswer) <= Convert.ToInt32(Global.questions[foundIndex].rangeUpper))
				{
                    Global.isCorrect = "YES";
                } else {
                    Global.isCorrect = "NO";
                }
			}

			// updating submission values
			Submission finishedQuestion = new Submission()
			{
				kuID = Info.KUID,
				//questionId = Global.questions[Global.currentIndex].id,
				quizId = Global.questions[foundIndex].quizId,
				courseId = Global.courseId,
				instructorId = Info.instructorId,
				answer = selectedAnswer,
				correct = Global.isCorrect,
				//id = foundIndex.ToString()
			};

			// inserting submission
			Global.answeredQuestions[foundIndex] = finishedQuestion;

			Debug.WriteLine(Global.answeredQuestions[foundIndex].kuID);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].quizId);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].courseId);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].instructorId);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].answer);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].correct);
			Debug.WriteLine(Global.answeredQuestions[foundIndex].id);
        }

        // appending submissions array to json file and dismissing quiz window
        public void SubmitQuiz(object sender, EventArgs e) {
            string serializedJson;

			// url of db.json file
            var dbPath = Info.IP + "/submission";
			// creating http client
			HttpClient client = new HttpClient();


            // iterating through submissions and appending json file on db
            for (int i = 0; i < Global.answeredQuestions.Count; i++) {
                serializedJson = JsonConvert.SerializeObject(Global.answeredQuestions[i]);
				var content = new System.Net.Http.StringContent(serializedJson, System.Text.Encoding.UTF8, "application/json");
				// updating json content
				client.PostAsync(dbPath, content);
            }

            // resetting values
            Global.currentIndex = 0;
            Global.overallCount = 0;
            Global.TFQuestions.Clear();
            Global.MultipleQuestions.Clear();
            Global.ShortAnswerQuestions.Clear();
            Global.answeredQuestions.Clear();
            Global.submissions.Clear();

            // dismissing quiz window
            App.MasterDetailPage.Detail = new NavigationPage(new ViewCourse(Global.courseName, Global.courseId));
        }
    }
}
