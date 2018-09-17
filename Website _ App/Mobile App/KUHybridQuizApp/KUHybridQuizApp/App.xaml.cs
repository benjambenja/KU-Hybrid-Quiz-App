using Xamarin.Forms;

namespace KUHybridQuizApp
{
    public partial class App : Application
    {
        public static MasterDetailPage MasterDetailPage;

        public App()
        {
            InitializeComponent();

            MasterDetailPage = new MasterDetailPage()
            {
                Master = new KUHybridQuizApp.NavMenu(),
                Detail = new NavigationPage(new KUHybridQuizAppPage()),
                IsGestureEnabled = false,
                Icon = "ic_menu.png",
            };

            MainPage = MasterDetailPage;

        }

        protected override void OnStart()
        {
            // Handle when your app starts
        }

        protected override void OnSleep()
        {
            // Handle when your app sleeps
        }

        protected override void OnResume()
        {
            // Handle when your app resumes
        }
    }
}
