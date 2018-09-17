using System;
namespace KUHybridQuizApp.InstructorPortal
{
    public class RetrieveData
    {
        // constructor
        public RetrieveData()
        {
        }

        // member variables
        private string[] courseNames;
		// in the future this will be pulled from servers, for now it uses a temporary value
		private int courseCount = 5;

        // setter for courseNames
        // in the future this will pull from servers for data, for now it uses placeholder values
        public void setCourseNames() {
            for (int i = 0; i < courseCount; i++) {
                courseNames[i] = (i + 1).ToString();
            }
        }

        // getter for courseNames
        public string[] getCourseNames() {
            return courseNames;
        }

        // setter for courseCount
        // in the future will pull from servers
        public void setCourseCount() {
            
        }

        // getter for courseCount
        public int getCourseCount() {
            return courseCount;
        }
    }
}
