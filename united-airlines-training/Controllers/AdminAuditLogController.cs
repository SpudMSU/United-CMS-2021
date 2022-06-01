using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using united_airlines_training.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace united_airlines_training.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class AdminAuditLogController : ControllerBase
    {

        // database connection context
        private readonly tomtcmsContext _context;
        readonly SqlConnection con;

        /// <summary>
        /// constructor
        /// 
        public AdminAuditLogController(tomtcmsContext context)
        {
            _context = context;
            con = StaticFunctions.GetConnection();

        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminAuditLog>>> GetAdminAuditLog()
        {
            return await _context.AdminAuditLog.ToListAsync();

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdminAuditLog>> GetAdminAuditLog(string id)
        {
            var log = await _context.AdminAuditLog.FindAsync(int.Parse(id));
            if (log == null)
            {
                return NoContent();
            }
            return log;
        }

        [HttpPost]
        public async Task<ActionResult<AdminAuditLog>> PostEntry(AdminAuditLog entry)
        {
            entry.ID = _context.AdminAuditLog.Count() + 1;
            _context.AdminAuditLog.Add(entry);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetAdminAuditLog", new { id = entry.ID }, entry);
        }

        [HttpGet("count")]
        public IActionResult getNumEntries()
        {
            Int32 count = _context.AdminAuditLog.Count() + 1;
            return Ok(new { count });
        }

        [HttpPut]
        public async Task<IActionResult> Revert(AdminAuditLog entry)
        {
            entry.Reverted = !entry.Reverted;

            _context.Entry(entry).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return NoContent();
        }


        private string[] months = { "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" };
        private int monthToNum(string month)
        {
            return Array.IndexOf(months, month) + 1;
        }
        private bool isMonth(string month)
        {
            return months.Contains(month);
        }
        private string parsePartialDate(string dateToken, bool firstToken)
        {
            if (dateToken.Length <= 2 && firstToken)
            {
                return @" (DATEPART(dd, ChangeDate) =" + dateToken + ") AND ";
            }
            else if (isMonth(dateToken))
            {
                return @" (DATEPART(mm, ChangeDate) =" + monthToNum(dateToken) + ") AND ";
            }
            else
            {
                return @" (DATEPART(yy, ChangeDate) =" + dateToken + ") AND ";
            }
        }

        private string parseDate(MatchCollection dateTokens)
        {
            if (dateTokens.Count() >= 3)
            {
                return @"(DATEPART(yy, ChangeDate) = " + dateTokens[2].Value + ") " +
                    "AND (DATEPART(mm, ChangeDate) = " + monthToNum(dateTokens[1].Value) + ") " +
                    "AND (DATEPART(dd, ChangeDate) = " + dateTokens[0].Value + ") AND ";
            }
            string query = parsePartialDate(dateTokens[0].Value, true);

            if (dateTokens.Count() == 2)
            {
                query += parsePartialDate(dateTokens[1].Value, false);
            }
            return query;
        }

        private string parseItemSearch(MatchCollection matches)
        {
            Match match = matches[0];
            string[] arr = { "Channel", "Media", "Comment", "User" };
            if (matches.Count() > 1 && arr.Contains(match.Value))
            {
                return @"Category LIKE '%" + match.Value + "%' AND Item LIKE '%" + match.NextMatch().Value + "%' AND ";
            }
            else if (arr.Contains(match.Value))
            {
                return @"Category LIKE '%" + match.Value + "%' AND ";
            }
            return @"Item LIKE '%" + match.Value + "%' AND ";
        }
        [HttpGet("search")]
        public ActionResult<IEnumerable<AdminAuditLog>> GetUsersFromSearch([FromQuery] string[] tokenStrings, [FromQuery] string[] columnNames)
        {
            // convert the token string into tokens using regex
            Regex rx = new Regex(@"(\w+){1,}");
            // create the query using those tokens
            string queryString = @"
				SELECT *
				FROM [AdminAuditLog]
                WHERE ";

            for (int i = 0; i < tokenStrings.Length; i++)
            {
                MatchCollection matches = rx.Matches(tokenStrings[i]);
                foreach (Match match in matches.ToArray())
                {
                    if (columnNames[i] == "UserRole")
                        queryString += @"UserRole LIKE '%" + match.Value + "%' AND ";
                    else if (columnNames[i] == "ChangeDate")
                    {
                        queryString += parseDate(matches);
                        break;
                    }
                    else if (columnNames[i] == "Category" )
                    {
                        queryString += parseItemSearch(matches);
                        break;
                    }
                    else
                    {
                        queryString += @"" + columnNames[i] + " LIKE '%" + match.Value + "%' AND ";
                    }
                }
            }
            queryString = queryString.Substring(0, queryString.Length - 5); //< remove the last AND
            SqlCommand query = new SqlCommand(queryString, con);
            //query.Parameters.AddWithValue("@ID", keywordID);
            List<AdminAuditLog> result = new List<AdminAuditLog>();
            // attempt to run/read the query
            try
            {
                con.Open();
                query.CommandType = CommandType.Text;
                SqlDataReader rdr = query.ExecuteReader(); //< execute the query
                // read its results:
                while (rdr.Read())
                {
                    result.Add(Models.AdminAuditLog.SQLtoLog(rdr));
                }
                con.Close();
            }
            catch (SqlException ex)
            {
                StaticFunctions.DisplaySqlException(ex);
            }
            return new ActionResult<IEnumerable<AdminAuditLog>>(result);
        }//*/
    }
}
