using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace united_airlines_training.Models
{
    public partial class ChangedMedia
    {

        [Key]
        public int ChangeID { get; set; }
#nullable enable

        public int? MediaID { get; set; }
        public string? MediaStatus { get; set; }
        /// <summary>
        /// Integer identifier for this media item
        /// </summary>
        

        public string? Title { get; set; }

       
        /// <summary>
        /// Description of the item
        /// </summary>
        public string? Description { get; set; }
        /// <summary>
        /// url path to the item's thumbnail image
        /// </summary>
        /// 
        /// <summary>
        /// Title of the item
        /// </summary>
        
        public string? ThumbnailPath { get; set; }

        public int? MediaTypeID { get; set; }

        /// <summary>
        /// url path of this item's data
        /// </summary>
        public string? Path { get; set; }

        public bool? FlaggedAllUsers { get; set; }
        public string? FlaggedLocations { get; set; }
        public string? FlaggedJobCodes { get; set; }
        public string? FlaggedDepartments { get; set; }
        public string? FlaggedJobGroups { get; set; }
        public string? FlaggedCostCenters { get; set; }

        /// <summary>
        /// When this item was created
        /// </summary>
        public DateTime? CreatedAt { get; set; }

#nullable disable
        /// <summary>
        /// getter/setter for the type of this media item
        /// (also sets its mediatypeid)
        /// </summary>
        //public virtual MediaType MediaType { get; set; }


        /// <summary>
        /// Parses an sql data reader for MediaItem attributes,
        /// then creates a MediaItem object from those attributes
        /// </summary>
        /// <param name="reader"></param>
        /// <returns></returns>
        public static MediaItem SQLToMediaItem(SqlDataReader reader)
        {
            MediaItem newMedia = new MediaItem();
            foreach (var prop in newMedia.GetType().GetProperties())
            {
                newMedia.GetType().GetProperty(prop.Name).SetValue(newMedia, reader[prop.Name] == DBNull.Value ? null : reader[prop.Name], null);
            }
            return newMedia;
        }
    }
}
