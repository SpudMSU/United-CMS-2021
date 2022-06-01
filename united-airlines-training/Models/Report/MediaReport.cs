using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace united_airlines_training.Models.Report
{
    public class RateRecord
    {
#nullable enable
        public string? UID { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? JobRoleCode { get; set; }
        public string? Department { set; get; }
        public string? LocationCode { set; get; }
        public bool? Like { get; set; }
        public int? ClickedAmount { get; set; }
        public string? UpdatedAt { get; set; }
        public float? WatchLength { get; set; }
#nullable disable
        public static RateRecord SqltoRateRecord(SqlDataReader rdr)
        {
            RateRecord res = new RateRecord();
            foreach (var prop in res.GetType().GetProperties())
            {
                var display = prop.Name;
                if (prop.Name == "UpdatedAt")
                {
                    DateTime T = (DateTime)rdr["UpdatedAt"];

                    res.UpdatedAt = T.ToString("ddd MMM dd yyyy");
                }
                else
                    res.GetType().GetProperty(prop.Name).SetValue(res, rdr[prop.Name] == DBNull.Value ? null : rdr[prop.Name], null);
            }
            return res;
        }
        
    }
    public class MediaReport
    {
        public int likes { get; set; }
        public int dislikes { get; set; }
        public double ldRatio { get; set; }
        public double Utilization { get; set; }
        public List<RateRecord> ratings { get; set; }
        public MediaItem media { get; set; }
        public double watchDuration { get; set; }
    }
}
