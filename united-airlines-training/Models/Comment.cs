using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Represents the attributes that are defined in the Comment table
    /// </summary>
    public class Comment
    {
        public string UID { get; set; }
        public int MediaID { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CommentID { get; set; }
        public string Description { get; set; }
        public bool Queued { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
