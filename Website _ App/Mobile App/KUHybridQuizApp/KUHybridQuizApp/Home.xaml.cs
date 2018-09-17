using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Net.Http;

using System.Diagnostics;

using Xamarin.Forms;


namespace KUHybridQuizApp
{
    public partial class Home : ContentPage
    {

        public Home()
        {
            InitializeComponent();

            App.MasterDetailPage.IsGestureEnabled = true;

            // setting navigation bar title
            this.Title = "Courses";

            // templating listview for courses
            //Global.courses = GetData();
            Global.courses = new List<Course>();
            Global.rosters = new List<Roster>();
            Info.sections = new List<string>();
            GetData();
            courseList.ItemsSource = Global.courses;
        }

        // class to hold array of course objects so that it can be manipulated throughout page
        public static class Global {
            public static List<Course> courses;
            public static List<Roster> rosters;
        }

        // retreiving json file, parsing it, and returning it as a list of RootObject
        public static void GetData() {
            //        for (int i = 0; i < Info.sections.Length; i++) {
            //            Debug.WriteLine(Info.sections.Length);
            //// url of db.json file
            //            var dbPath = new Uri(Info.IP + "/course?Section=" + Info.sections[i]);
            //// creating http client
            //HttpClient client = new HttpClient();
            //// reading json file from url as string
            //var content = client.GetStringAsync(dbPath);
            //    Debug.WriteLine(content.Result);
            //    // parsing string as list of RootObject
            //    var foundCourse = new List<Course>();
            //    foundCourse = JsonConvert.DeserializeObject<List<Course>>(content.Result);
            //    Debug.WriteLine(foundCourse[0].Name);
            //    Global.courses.AddRange(foundCourse);
            //}

            var dbPath = new Uri(Info.IP + "/roster");
            HttpClient client = new HttpClient();
            var content = client.GetStringAsync(dbPath);
            Debug.WriteLine(content.Result);
            var foundRosters = JsonConvert.DeserializeObject<List<Roster>>(content.Result);
            Global.rosters.AddRange(foundRosters);

            Debug.WriteLine("ROSTER LENGTH: " + Global.rosters.Count);
            Debug.WriteLine("INFO.KUID = " + Info.KUID);

            var counter = 0;
            for (int i = 0; i < Global.rosters.Count; i++) {
                Debug.WriteLine("ROSTER KUID AT INDEX IS: " + Global.rosters[i].kUID);
                if (Global.rosters[i].kUID == Info.KUID) {
                    Info.sections.Add(Global.rosters[i].courseId);
                    Debug.WriteLine("JUST ADDED " + Info.sections[counter] + "TO SECTIONS");
                    counter++;
                }
            }

            try {
                for (int i = 0; i < Info.sections.Count; i++)
				{
					dbPath = new Uri(Info.IP + "/course?courseId=" + Info.sections[i]);
					client = new HttpClient();
					content = client.GetStringAsync(dbPath);
					var foundCourse = JsonConvert.DeserializeObject<List<Course>>(content.Result);
					Global.courses.AddRange(foundCourse);
				}
            } catch (System.Exception) {
              // do nothing  
            }
		}

        // creating course class to later make an array of course objects, filling these member
        // variables with data from db.json
        public class Course {
            public string title { get; set; }
            public string number { get; set; }
            public string department { get; set; }
            public string semester { get; set; }
            public string year { get; set; }
            public string section { get; set; }
            public string courseId { get; set; }
            public string profId { get; set; }
            public string id { get; set; }
        }

		// class of type student
		public class Roster
		{
			public string kUID { get; set; }
            public string firstName { get; set; }
            public string lastName { get; set; }
            public string courseId { get; set; }
			public string id { get; set; }
		}

        // handles selection of items in listview
        void OnItemSelect(object sender, SelectedItemChangedEventArgs e) {
            if (e.SelectedItem == null) {
                // on deselection
                return;
            } else {
                // gets index of item selected in listview
                var index = (courseList.ItemsSource as List<Course>).IndexOf(e.SelectedItem as Course);
                // sets current courseId
                Info.currentCourseId = Global.courses[index].courseId;
                // opens up courseview page
                App.MasterDetailPage.Detail = new NavigationPage(new ViewCourse(Global.courses[index].title, Global.courses[index].courseId));
            }
        }
    }
}
