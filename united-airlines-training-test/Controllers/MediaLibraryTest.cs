using System;
using System.Collections.Generic;
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
    public class MediaLibraryTest : AbstractDatabaseTester
    {
        private MediaLibraryController _testLibrary = null;

        public MediaLibraryTest() : base()
        {
            //_testLibrary = new MediaLibraryController(_testDatabaseContext);
            SetDatabaseStatus(false);
        }

        [Fact]
        public async void TestCRUD()
        {

            Assert.NotNull(_testLibrary);

            var allExisting = _testLibrary.GetAllMedia().Result.Value;
            Assert.Empty(allExisting);
            
            if (_testMedia.Count < 1)
            {
                throw new IndexOutOfRangeException("Not enough media populating test library to be tested");
            }

            MediaItem toPost = _testMedia[0];
            await _testLibrary.PostMediaItem(toPost);
            allExisting = _testLibrary.GetAllMedia().Result.Value;
            Assert.NotEmpty(allExisting);

            MediaItem first = allExisting.ElementAt(0);
            // mediaID is set automatically by the database,
            // all other attributes should be identical
            toPost.MediaID = first.MediaID;
            Assert.Equal(first, toPost);

            // come back and test Update and Delete



            //SetDatabaseStatus(false);
        }
    }
}
