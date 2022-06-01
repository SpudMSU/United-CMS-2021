namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Feedback data to be provided to the general feedback and media feedback controllers
    /// </summary>
    public class FeedbackUserData
    {
        public User UFeedback { get; set; }

        public string Phone { get; set; }
#nullable enable
        public GeneralFeedback? GFeedback { get; set; }
        public MediaFeedback? MFeedback { get; set; }
        public string? MediaTitle { get; set; }

        public string? Subject { get; set; }
#nullable disable
    }
}
