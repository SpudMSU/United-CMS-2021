using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using System.Data.SqlClient;

namespace united_airlines_training.Models
{
    public class AdminAuditLog
    {

        [Key]
        public int ID { get; set; }
        public string Category { get; set; }

        public string Item { get; set; }

        public string Change { get; set; }

        public string Username { get; set; }

        public string UserRole{ get; set; }

        public DateTime ChangeDate{ get; set; }

        public int MediaID { get; set; }

#nullable enable

        public bool Reverted { get; set; }


#nullable disable

        public static AdminAuditLog SQLtoLog(SqlDataReader reader)
        {
            AdminAuditLog newLog = new AdminAuditLog();

            foreach (var prop in newLog.GetType().GetProperties())
            {
                newLog.GetType().GetProperty(prop.Name).SetValue(newLog, reader[prop.Name] == DBNull.Value ? null : reader[prop.Name], null);
            }
            return newLog;
        }
    }

}
