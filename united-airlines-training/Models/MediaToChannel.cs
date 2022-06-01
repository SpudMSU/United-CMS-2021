namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// A connection between a channel and media item
    /// </summary>
    public class MediaToChannel
    {
        public int ChannelID { get; set; }
        public int MediaID { get; set; }
    }
}
