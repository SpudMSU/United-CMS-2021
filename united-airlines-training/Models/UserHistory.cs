using System;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// Represents the history between one User
    /// and one media item
    /// </summary>
    public partial class UserHistory
    {

        public string UID { get; set; }

        public int MediaID { get; set; }
        /// <summary>
        /// How long the user viewed this item
        /// </summary>
        public float WatchLength { get; set; }
        /// <summary>
        /// When the user first accessed this item
        /// </summary>
        public DateTime CreatedAt { get; set; }
        /// <summary>
        /// How many times the user viewed this item
        /// </summary>
        public int ClickedAmount { get; set; }
        /// <summary>
        /// True if the associated user has seen this video all the way through
        /// </summary>
        public bool CompleteView { get; set; }
        /// <summary>
        /// When the user last accessed this item
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        //This was coming up as NULL at API endpoint
        //public virtual MediaItem Media { get; set; }
        //public virtual User User { get; set; }
    }
}
