using System;
using System.Collections.Generic;

namespace KUHybridQuizApp
{
    public static class Info
    {
        public static string username = "";
        public static string KUID = "";
        public static List<String> sections;
        public static string currentCourseId;
        public static string instructorId;
        public static int currentIndex = 0;
        public static int overallCount = 0;
		public static List<Submission> submissions;
		public static List<Submission> answeredQuetions = new List<Submission>();

        public static string IP = "http://66.253.137.68:3000";
        public static bool isAuthenticated = false;
    }

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
}
