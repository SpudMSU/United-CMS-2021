using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace united_airlines_training.Models
{
    public partial class ChangedUser
    {
        [Key]
        public int ChangeID { get; set; }
#nullable enable
        public string? UID { get; set; }
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

        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
#nullable disable
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
