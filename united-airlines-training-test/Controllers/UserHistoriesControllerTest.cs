using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using united_airlines_training.Controllers;
using united_airlines_training.Models;
using Xunit;

namespace united_airlines_training_test.Controllers
{
    /// <summary>
    /// Author: Shawn Pryde
    /// </summary>
    public class UserHistoriesControllerTest : AbstractDatabaseTester
    {
        // testing objects
        private UserHistoriesController _testUserHist = null;

        private List<UserHistory> _testHistories;

        public UserHistoriesControllerTest() : base()
        {

        }

        [Fact]
        public void TestCRUD()
        {
            SetDatabaseStatus(true);
            // create dummy test data            
            _testUserHist = new UserHistoriesController(_testDatabaseContext);

            Assert.NotNull(_testUserHist);

            // No values in table yet
            var allExisting = _testUserHist.GetAllUserHistories().Result.Value;
            Assert.Empty(allExisting);

            #region Create / Read
            // add generic values
            PopulateTestHistories();
            // read
            /*
            UserHistory entry1 = _testUserHist.GetUserHistory(_testHistories[0].User.UID, _testHistories[0].Media.MediaID).Result.Value;
            Assert.Equal(_testHistories[0], entry1);//*/
            #endregion

            SetDatabaseStatus(false);
        }

        /// <summary>
        /// Populates the list of testing userHistories with filler data
        /// </summary>
        private async void PopulateTestHistories()
        {
            // media and user are required before adding to database
            AddAllTestMediaTypes();
            AddAllTestMedia();
            AddAllTestUsers();

            // get all users
            var userController = new UserController(_testDatabaseContext);
            var allUsers = userController.GetUser().Result.Value.ToArray();
            Assert.True(allUsers.Length >= 2);
            // get all media
            //var mediaController = new MediaLibraryController(_testDatabaseContext);
            //var allMedia = mediaController.GetAllMedia().Result.Value.ToArray();
            //Assert.True(allMedia.Length >= 1);
            // determine histories based on pre-existing users and media within the database
            _testHistories = new List<UserHistory>()
            {
                new UserHistory
                {
                    WatchLength = 1.01f,
                    CreatedAt = _declerationOfIndependence,
                    UpdatedAt = _tenYearsAfterDec,
                    ClickedAmount = 1,
                    CompleteView = false
                },
                new UserHistory
                {
                    WatchLength = 2.34f,
                    CreatedAt = _tenYearsAfterDec,
                    UpdatedAt = _declerationOfIndependence,
                    ClickedAmount = 4,
                    CompleteView = true
                }
            };
            foreach(var uh in _testHistories)
            {
                await _testUserHist.PostUserHistory(uh);
            }
            _testDatabaseContext.SaveChanges();
        }
    }
}
