using System;
using System.Collections.Generic;
using System.Text;
using Xunit;
using united_airlines_training.Models;
using Xunit.Sdk;

namespace united_airlines_training_test
{
    /// <summary>
    /// Author: Shawn Pryde
    /// </summary>
    public class MediaItemTest
    {
        // reference to the class instance we are testing
        private TestMediaItem _testMediaItem;

        public MediaItemTest()
        {
        }

        [Fact]
        public void TestContructor()
        {
            #region Test standard ctor
            string title = "Hambo";
            string description = "a quaint restaraunt";
            string url = "/image/ham.png";

            _testMediaItem = new TestMediaItem
            {
                Title = title,
                Description = description,
                ThumbnailPath = url
            };
            Assert.Equal(title, _testMediaItem.Title);
            Assert.Equal(description, _testMediaItem.Description);
            Assert.Equal(url, _testMediaItem.ThumbnailPath);
            #endregion

            #region Test valid nulls
            title = "Hambo 2 Electric Boogaloo";

            _testMediaItem = new TestMediaItem
            {
                Title = title,
                Description = null,
                ThumbnailPath = null
            }; 

            Assert.Equal(title, _testMediaItem.Title);
            Assert.Null(_testMediaItem.Description);
            Assert.Null(_testMediaItem.ThumbnailPath);
            #endregion

            #region Test invalid nulls
            void NullExceptionCauser()
            {
                _testMediaItem = new TestMediaItem
                {
                    Title = null,
                    Description = description,
                    ThumbnailPath = url
                };
            }
            Assert.Throws<ArgumentNullException>(NullExceptionCauser);
            #endregion
        }

        [Fact]
        public void TestSet()
        {
            string title = "Hambo";
            string description = "a quaint restaraunt";
            string url = "/image/ham.png";

            _testMediaItem = new TestMediaItem 
            { 
                Title = title,
                Description = description, 
                ThumbnailPath = url 
            };

            Assert.Equal(title, _testMediaItem.Title);
            Assert.Equal(description, _testMediaItem.Description);
            Assert.Equal(url, _testMediaItem.ThumbnailPath);

            title = "Uh oh, I've changed";
            description = "Whatever will we do?";
            url = "shrug";
            _testMediaItem.Title = title;
            _testMediaItem.Description = description;
            _testMediaItem.ThumbnailPath = url;
            Assert.Equal(title, _testMediaItem.Title);
            Assert.Equal(description, _testMediaItem.Description);
            Assert.Equal(url, _testMediaItem.ThumbnailPath);

            // make sure we can't set non nullables to null
            void NullExceptionCauser()
            {
                _testMediaItem.Title = null;
            }
            Assert.Throws<ArgumentNullException>(NullExceptionCauser);
        }


        /// <summary>
        /// Empty mediaItem override class, used to test only mediaItem functionalities
        /// </summary>
        private class TestMediaItem : MediaItem { }
    }
}
