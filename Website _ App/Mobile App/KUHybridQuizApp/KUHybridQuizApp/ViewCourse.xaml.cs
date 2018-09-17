using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Net.Http;

using Xamarin.Forms;

namespace KUHybridQuizApp
{
    public partial class ViewCourse : ContentPage
    {
        public ViewCourse(string courseName, string courseId)
        {
            InitializeComponent();

            // setting title of page relative to courseName
            this.Title = courseName;

            // calling function to obtain quizzes, casts to array
            Global.quizzes = new List<Quiz>();
            GetData();

            // removing quizzes that are not set to be visible
            for (int i = 0; i < Global.quizzes.Count; i++) {
                if (Global.quizzes[i].isVisible == "INACTIVE") {
                    Global.quizzes.RemoveAt(i);
                }
            }

			// templating listview for quizzes
            quizList.ItemsSource = Global.quizzes;

            // updating courseId to be passed to ViewQuiz
            Global.courseId = courseId;

            // updating courseName to be passed to ViewQuiz
            Global.courseName = courseName;
        }

		// class to hold array of quiz objects so that it can be manipulated throughout page
		public static class Global
		{
            public static List<Quiz> quizzes;
            public static string courseId;
            public static string courseName;
		}

		// retreiving json file, parsing it, and returning it as a list of RootObject
		public static void GetData()
		{
			// url of db.json file
            var dbPath = new Uri(Info.IP + "/quiz?courseId=" + Info.currentCourseId);
			// creating http client
			HttpClient client = new HttpClient();
			// reading json file from url as string
			var content = client.GetStringAsync(dbPath);
            // parsing string as list of RootObject
            Global.quizzes = JsonConvert.DeserializeObject<List<Quiz>>(content.Result);
		}

		// creating course class to later make an array of Quiz objects, filling these member
		// variables with data from db.json
		public class Quiz
		{
			public string title { get; set; }
			public string courseId { get; set; }
			public string dateCreated { get; set; }
			public string instructions { get; set; }
            public string isVisible { get; set; }
            public string quizId { get; set; }
            public string instructorId { get; set; }
			public string id { get; set; }
		}

		// handles selection of items in listview
		void OnItemSelect(object sender, SelectedItemChangedEventArgs e)
		{
			if (e.SelectedItem == null)
			{
				// on deselection
				return;
			}
			else
			{
				// gets index of item selected in listview
                var index = (quizList.ItemsSource as List<Quiz>).IndexOf(e.SelectedItem as Quiz);
                Info.instructorId = Global.quizzes[index].instructorId;
				// opens up courseview page
                App.MasterDetailPage.Detail = new NavigationPage(new ViewQuiz(Global.quizzes[index].title, Global.quizzes[index].quizId, Global.courseId, Global.courseName));
			}
		}
    }
}
