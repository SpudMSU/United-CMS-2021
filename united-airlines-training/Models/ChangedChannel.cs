using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace united_airlines_training.Models
{
    public class ChangedChannel
    {
        [Key]

        public int ChangeID { get; set;  }

#nullable enable
        public int? ChannelID { get; set; }
        public string? Title { get; set; }

        public string? Description { get; set; }
        /// <summary>
        /// URL to the image for this channel's icon
        /// </summary>
        public string? Icon { get; set; }

        public int? ModifiedID { get; set; }
#nullable disable
        /// <summary>
        /// Parses an sql data reader for Channel attributes,
        /// then creates a Channel object from those attributes
        /// </summary>
        /// <param name="reader"></param>
        /// <returns></returns>
        public static ChangedChannel SQLToChannel(SqlDataReader reader)
        {
            ChangedChannel newChannel = new ChangedChannel();
            foreach (var prop in newChannel.GetType().GetProperties())
            {
                newChannel.GetType().GetProperty(prop.Name).SetValue(newChannel, reader[prop.Name] == DBNull.Value ? null : reader[prop.Name], null);
            }
            return newChannel;
        }

    }
}
