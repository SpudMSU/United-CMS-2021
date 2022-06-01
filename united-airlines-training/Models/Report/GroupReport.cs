using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace united_airlines_training.Models.Report
{
    public class GroupInfo
    {
        //United ID, First and Last Name, Job Code, Dept, Location, Cost Center,
        //Rating, Views, Last View, Media ID, Media Title, and Media Type
#nullable enable
        public string? UID { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? JobRoleCode { get; set; }
        public string? Department { set; get; }
        public string? LocationCode { set; get; }
        public string? CostCenterDesc { set; get; }
        public string? CostCenter{ set; get; }
        public bool? Like { get; set; }
        public int? ClickedAmount { get; set; }
        public string? UpdatedAt { get; set; }
        public int? MediaId { get; set; }
        public string? Title { get; set; }
        public int? MediaTypeID {get;set;}
#nullable disable
        public static GroupInfo SqltoRateRecord(SqlDataReader rdr)
        {
            GroupInfo res = new GroupInfo();
            foreach (var prop in res.GetType().GetProperties())
            {
                var display = prop.Name;
                if (prop.Name == "UpdatedAt")
                {
                    var k = rdr["UpdatedAt"];
                    Console.WriteLine(rdr["UID"].ToString() + " and " + rdr["MediaId"].ToString());
                    if (rdr["UpdatedAt"] == DBNull.Value)
                    {
                        res.UpdatedAt = "UNKNOW";
                    }                       
                    else
                    {
                        DateTime T = (DateTime)rdr["UpdatedAt"];
                        res.UpdatedAt = T.ToString("yyyy-MM-dd HH:mm:ss");
                    }

                }
                else
                    res.GetType().GetProperty(prop.Name).SetValue(res, rdr[prop.Name] == DBNull.Value ? null : rdr[prop.Name], null);
            }
            return res;
        }
    }
    public class GroupReport
    {
        public List<GroupInfo> info { get; set; }
    }
}
