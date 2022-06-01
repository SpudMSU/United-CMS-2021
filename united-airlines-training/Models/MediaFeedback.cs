using System;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Media feedback database model class
    /// </summary>
    public class MediaFeedback
    {
        public int MediaFeedbackID { get; set; }
        public int MediaId { get; set; }
        public string UID { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
