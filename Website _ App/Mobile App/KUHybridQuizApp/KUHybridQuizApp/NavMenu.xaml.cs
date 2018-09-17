using System;
using System.Diagnostics;
using System.Collections.Generic;

using Xamarin.Forms;

namespace KUHybridQuizApp
{
    public partial class NavMenu : ContentPage
    {
        public NavMenu()
        {
            InitializeComponent();

            // setting title of page in the constructor
            Title = "Navigation Menu";

            Icon = "ic_menu.png";
        }

        void Navigate(object sender, EventArgs e) {
            Button btn = (Button) sender;

            if ( btn.Text == "Courses") {
                App.MasterDetailPage.Detail = new NavigationPage(new KUHybridQuizApp.Home());
                App.MasterDetailPage.IsPresented = false;
            } else if (btn.Text == "Announcements") {
                
            } else if (btn.Text == "Contact") {
                App.MasterDetailPage.Detail = new NavigationPage(new Contact());
                App.MasterDetailPage.IsPresented = false;
            } else if (btn.Text == "Logout") {
                // calls Logout function to perform logout duties
                Logout();
            }
        }

        // will perform logout duties, currently only displays login page
        void Logout() {
            App.MasterDetailPage.Detail = new NavigationPage(new KUHybridQuizAppPage());
            App.MasterDetailPage.IsPresented = false;
        }
    }
}
