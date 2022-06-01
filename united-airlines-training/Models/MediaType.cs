using System.ComponentModel.DataAnnotations;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Represents the attributes that are defined in the MediaType table
    /// </summary>
    public partial class MediaType
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Icon { get; set; }
    }
}
