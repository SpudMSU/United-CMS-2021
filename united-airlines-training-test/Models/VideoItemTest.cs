//using System;
//using System.Collections.Generic;
//using System.Text;
//using Xunit;
//using united_airlines_training.Models;
//using Xunit.Sdk;

//namespace united_airlines_training_test.Models
//{
//    /// <summary>
//    /// Author: Shawn Pryde
//    /// </summary>
//    public class VideoItemTest
//    {
//        private VideoItem _videoItem;

//        public VideoItemTest()
//        {
            
//        }

//        [Fact]
//        public void TestConstructor()
//        {
//            string title = "Hambo";
//            string description = "a quaint restaraunt";
//            string thumbnail = "/image/ham.png";
//            string location = "/image/ham.png";
//            int size = 32;

//            int dur = 62;
//            int rate = 2;
//            int width = 1920;
//            int height = 1080;

//            _videoItem = new VideoItem
//            {
//                Title = title,
//                Size = size,
//                Path = location,
//                ThumbnailPath = thumbnail,
//                Duration = dur, 
//                Bitrate = rate,
//                FrameWidth = width,
//                FrameHeight = height,
//                Description = description   
//            };

//            Assert.Equal(dur, _videoItem.Duration);
//            Assert.Equal(rate, _videoItem.Bitrate);
//            Assert.Equal(width, _videoItem.FrameWidth);
//            Assert.Equal(height, _videoItem.FrameHeight);
//        }
//    }
//}
