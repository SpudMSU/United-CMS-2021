using System;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Represents the attributes that are defined in the User table
    /// </summary>
    public partial class User
    {

        [Key]
        public string UID { get; set; }
#nullable enable
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? EmploymentStatus { get; set; }
        public string? Company { get; set; }
        public int? RoleCode { get; set; }
        public string? JobRoleCode { get; set; }
        public string? JobGroup { get; set; }
        public string? OccupationTitle { get; set; }
        public string? Department { get; set; }
        public string? LocationCode { get; set; }
        public string? CostCenter { get; set; }
        public string? CostCenterDesc { get; set; }
#nullable disable
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Parses an sql data reader for MediaItem attributes,
        /// then creates a MediaItem object from those attributes
        /// </summary>
        /// <param name="reader"></param>
        /// <returns></returns>
        public static User SQLtoUser(SqlDataReader reader)
        {
            User newUser = new User();

            foreach (var prop in newUser.GetType().GetProperties())
            {
                newUser.GetType().GetProperty(prop.Name).SetValue(newUser, reader[prop.Name] == DBNull.Value ? null : reader[prop.Name], null);
            }
            return newUser;
        }
    }
}
