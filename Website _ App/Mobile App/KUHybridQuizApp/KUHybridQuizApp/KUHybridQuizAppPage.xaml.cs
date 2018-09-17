using System;
using System.Net.Http;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Diagnostics;

using Xamarin.Forms;

namespace KUHybridQuizApp
{
    public partial class KUHybridQuizAppPage : ContentPage
    {
        public KUHybridQuizAppPage()
        {
            InitializeComponent();

            NavigationPage.SetHasNavigationBar(this, false);
        }

		// class of type student
		public class Student
		{
			public string username { get; set; }
			public string password { get; set; }
			public string kUID { get; set; }
            public string[] section { get; set; }
			public string id { get; set; }
		}

		// class to hold list of student objects so that it can be manipulated throughout page
		public static class Global
		{
			public static List<Student> students;
            public static int count;
		}

        void SignUp(object sender, EventArgs e) {
            try {
				if (FrameSignUp.IsVisible == true)
				{
					// validation of signup credentials will go here
					// will require parameters consisting of text from each textbox
					// if validation and signup proves true, then proceed to landing page
					// if validation and signup proves false, then present error modal

					if (SignUpUsername.Text != null && SignUpPassword.Text != null && SignUpConfirmPassword.Text != null
						&& SignUpKUID.Text != null)
					{
						// all forms have an entry
						if (SignUpPassword.Text == SignUpConfirmPassword.Text)
						{
							// both password entries match

							// getting total count of students already, so that id of new student can be correct
							// url of db.json file
							var dbPath = new Uri(Info.IP + "/student");
							// creating http client
							HttpClient client = new HttpClient();
							// reading json file from url as string
							var content = client.GetStringAsync(dbPath);
							Global.students = JsonConvert.DeserializeObject<List<Student>>(content.Result);
							Global.count = Global.students.Count;

							// url of db.json file
							dbPath = new Uri(Info.IP + "/student?username=" + SignUpUsername.Text);
							// reading json file from url as string
							content = client.GetStringAsync(dbPath);
							Global.students = JsonConvert.DeserializeObject<List<Student>>(content.Result);

							if (Global.students[0].username != SignUpUsername.Text)
							{
								// username is not already in use, creating new student
								Student newStudent = new Student()
								{
									username = SignUpUsername.Text,
									password = SignUpPassword.Text,
									kUID = SignUpKUID.Text,
									id = (Global.count + 1).ToString()
								};

								// posting new student to db.json
								dbPath = new Uri(Info.IP + "/student");
								var serializedJson = JsonConvert.SerializeObject(newStudent);
								var contentToPost = new System.Net.Http.StringContent(serializedJson, System.Text.Encoding.UTF8, "application/json");
								// updating json content
								client.PostAsync(dbPath, contentToPost);

								// assigning student information to class
								Info.username = Global.students[0].username;
								Info.KUID = Global.students[0].kUID;

								// presenting home page once signup is completed
								App.MasterDetailPage.Detail = new NavigationPage(new KUHybridQuizApp.Home());
							}
							else
							{
								// username is already in use
							}
						}
						else
						{
							// passwords do not match, presenting label
							lblPasswordMatch.IsVisible = true;
						}
					}
					else
					{
						// all forms do not have an entry, presenting invalid sign up label
						lblInvalidSignUp.IsVisible = true;
					}
				}
				else
				{
					FrameSignUp.IsVisible = true;
					FrameLogin.IsVisible = false;
					btnLogin.IsVisible = false;
					btnSignUp.IsVisible = false;
				}
            } catch (System.Exception) {
                lblErrorOccured.IsVisible = true;
            }
        }

		// performs login verifications
		// if validation proves credentials true, then proceed to landing page
		// if validation proves credentials false, then present error label
		void Login(object sender, EventArgs e) {
            Debug.WriteLine("CODE IS HERE");
            try {
				if (FrameLogin.IsVisible == true)
				{
					// url of db.json file
					var dbPath = new Uri(Info.IP + "/student?username=" + LoginUsername.Text);

					Debug.WriteLine(dbPath);
					// creating http client
					HttpClient client = new HttpClient();
					// reading json file from url as string
					var content = client.GetStringAsync(dbPath);
					//Debug.WriteLine(content.Result);
					Global.students = JsonConvert.DeserializeObject<List<Student>>(content.Result);
					//Debug.WriteLine(Global.students[0].section[0]);

					// comparing retrieved information to inputed information
					if (Global.students[0].username == LoginUsername.Text && Global.students[0].password == LoginPassword.Text)
					{
						// assigning student information to class
						Info.username = Global.students[0].username;
						Info.KUID = Global.students[0].kUID;
						//Info.sections = Global.students[0].section;

						Info.isAuthenticated = true;

						// presenting home page once login is completed
						App.MasterDetailPage.Detail = new NavigationPage(new KUHybridQuizApp.Home());
						// PresentNextPage();
					}
					else
					{
						// presenting invalid login label
						lblInvalidLogin.IsVisible = true;
					}

				}
				else
				{
					FrameSignUp.IsVisible = false;
					FrameLogin.IsVisible = true;
					btnLogin.IsVisible = false;
					btnSignUp.IsVisible = false;
				}
            } catch (System.Exception) {
                lblErrorOccured.IsVisible = true;
            }
        }
    }
}
