/// <summary>
/// Author: Shawn Pryde
/// -
/// Represents a single media item from our database
/// </summary>
using System;
using System.Data.SqlClient;
using CsvHelper;
using CsvHelper.Configuration.Attributes;

namespace united_airlines_training.Models
{
    public partial class MediaItem
    {

        private string _title = "";
        [Name("MediaStatus")]
        public string MediaStatus { get; set; }
        /// <summary>
        /// Integer identifier for this media item
        /// </summary>
        [Name("MediaID")]
        public int MediaID { get; set; }

        /// <summary>
        /// Title of the item
        /// </summary>
        [Name("Title")]
        public string Title
        {
            get => _title;
            set
            {
                _title = value ?? throw new ArgumentNullException();
            }
        }

        [Name("MediaTypeID")]
        public int MediaTypeID { get; set; }

        /// <summary>
        /// When this item was created
        /// </summary>
        [Name("CreatedAt")]
        public DateTime CreatedAt { get; set; }
#nullable enable
        /// <summary>
        /// Description of the item
        /// </summary>
        [Name("Description")]
        public string? Description { get; set; }
        /// <summary>
        /// url path to the item's thumbnail image
        /// </summary>
        [Name("ThumbnailPath")]
        public string? ThumbnailPath { get; set; }

        /// <summary>
        /// url path of this item's data
        /// </summary>
        [Name("Path")]
        public string? Path { get; set; }

        [Name("FlaggedAllUsers")]
        public bool? FlaggedAllUsers { get; set; }
        [Name("FlaggedLocations")]
        public string? FlaggedLocations { get; set; }
        [Name("FlaggedJobCodes")]
        public string? FlaggedJobCodes { get; set; }
        [Name("FlaggedDepartments")]
        public string? FlaggedDepartments { get; set; }
        [Name("FlaggedJobGroups")]
        public string? FlaggedJobGroups { get; set; }
        [Name("FlaggedCostCenters")]
        public string? FlaggedCostCenters { get; set; }
        [Name("CommentingEnabled")]
        public bool? CommentingEnabled { get; set; }

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
