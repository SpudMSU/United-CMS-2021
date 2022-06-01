namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Represents the attributes that are defined in the Role table
    /// </summary>
    public class Role
    {
        public int RoleID { get; set; }
        #nullable enable
        public string? RoleLevel { get; set; }
        #nullable disable
    }
}
