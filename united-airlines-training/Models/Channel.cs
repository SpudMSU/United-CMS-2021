using System;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// A single channel instance from our database
    /// </summary>
    public class Channel
    {
        [Key]
        public int ChannelID { get; set; }
        public string Title { get; set; }
#nullable enable
        public string? Description { get; set; }
        /// <summary>
        /// URL to the image for this channel's icon
        /// </summary>
        public string? Icon { get; set; }
#nullable disable
        /// <summary>
        /// Parses an sql data reader for Channel attributes,
        /// then creates a Channel object from those attributes
        /// </summary>
        /// <param name="reader"></param>
        /// <returns></returns>
        public static Channel SQLToChannel(SqlDataReader reader)
        {
            Channel newChannel = new Channel();
            foreach (var prop in newChannel.GetType().GetProperties())
            {
                newChannel.GetType().GetProperty(prop.Name).SetValue(newChannel, reader[prop.Name] == DBNull.Value ? null : reader[prop.Name], null);
            }
            return newChannel;
        }

    }
}
