using System;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Represents the attributes that are defined in the Rating table
    /// </summary>
    public class Rating
    {
        public string UID { get; set; }
        public int MediaID { get; set; }
        public bool Like { get; set; }
        public DateTime? CreatedAt { get; set; }

    }
}
