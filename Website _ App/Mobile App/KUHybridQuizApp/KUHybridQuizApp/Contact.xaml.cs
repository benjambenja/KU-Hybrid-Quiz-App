using System;
using System.Collections.Generic;

using Xamarin.Forms;

namespace KUHybridQuizApp
{
    public partial class Contact : ContentPage
    {
        public Contact()
        {
            InitializeComponent();

            // setting the title of the page
            this.Title = "Contact";
        }

        // starts phone call with number of technical support
        void MakeCall(object sender, EventArgs e) {
            Device.OpenUri(new Uri("tel:785-727-9466"));
        }

        // opens up new email with recipient set as technical support
        void MakeEmail(object sender, EventArgs e) {
            Device.OpenUri(new Uri("mailto:nazma.sulthana@ku.edu"));
        }
    }
}
