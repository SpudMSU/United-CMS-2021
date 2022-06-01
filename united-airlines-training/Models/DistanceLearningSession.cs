using System;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// Represents a single link in a list of tech 
    /// talk sessions for a given tech talk event
    /// </summary>
    public class DistanceLearningSession
    {
        public int ID { get; set; }
        public int MediaID { get; set; }

      public string UrlPath { get; set; }
        public DateTime StartTime { get; set; }

      public DateTime EndTime { get; set; }
      public bool? IsPasswordProtected { get; set; }
      public string? Password { get; set; }


   }
}
