using System;
using System.ComponentModel.DataAnnotations;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// General feedback database model class
    /// </summary>
    public class GeneralFeedback
    {
        [Key]
        public int GeneralFeedbackId { get; set; }
        public string UID { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        
    }
}
