using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using united_airlines_training.Models;
using System.Text.RegularExpressions;
using System.Data.SqlClient;
using System.Data;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// User controller to make CRUD function calls and allow to read and write to MSSQL database
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly tomtcmsContext _context;
        readonly SqlConnection con;

        /// <summary>
        /// User Controller constructor
        /// </summary>
        /// <returns></returns>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public UserController(tomtcmsContext context)
        {
            _context = context;
            con = StaticFunctions.GetConnection();
        }

        /// <summary>
        /// GET: api/User/uid
        /// Get CURRENT user header UID
        /// </summary>
        /// <returns>JSON object with the UID</returns>
        [HttpGet("uid")]
        public IActionResult GetUserID()
        {
            return Ok(HttpContext.Response.Headers["uid"]);
        }

        /// <summary>
        /// GET: api/User/CurrentUser
        /// Get CURRENT user header information
        /// </summary>
        /// <returns>JSON object with the user object</returns>
        [HttpGet("CurrentUser")] // .../api/User/CurrentUser
        public IActionResult GetCurrentUser()
        {
            var user = (User)HttpContext.Items["user"];
            var userDb = GetUser(user.UID).Result.Value;
            
            if (userDb != null)
            {
                var dbVal = userDb.GetType().GetProperty("RoleCode").GetValue(userDb);
                user.RoleCode = int.Parse(dbVal.ToString());
            }
            
            HttpContext.Items.Add("userAll", user);
            return Ok(user);
        }

        /// <summary>
        /// GET: api/User/EmploymentStatus
        /// Get distinct employment statuses in databases for the user admin page
        /// </summary>
        /// <returns>JSON object with the results of the distinct employment statuses</returns>
        [HttpGet("EmploymentStatus")]
        public IActionResult GetDistinctEmploymentStatus()
        {
            string queryString = @"
                    select DISTINCT EmploymentStatus
                    from [User]";

            SqlCommand query = new SqlCommand(queryString, con);
            List<string> result = new List<string>();

            try
            {
                con.Open();
                query.CommandType = CommandType.Text;
                SqlDataReader rdr = query.ExecuteReader(); //< execute the query
                // read its results:
                while (rdr.Read())
                {
                    result.Add(rdr["EmploymentStatus"].ToString());
                }
                con.Close();
            }
            catch (SqlException ex)
            {
                StaticFunctions.DisplaySqlException(ex);
            }
            return Ok(result);
        }

        /// <summary>
        /// GET: api/User
        /// Get all users in user table
        /// </summary>
        /// <returns>List of all users found in database</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUser()
        {
            return await _context.User.ToListAsync();
        }

        /// <summary>
        /// GET: api/User/u123456
        /// Get specific user based on param id
        /// </summary>
        /// <param name="id">UID</param>
        /// <returns>Found user or No Content is returned</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(string id)
        {
            var user = await _context.User.FindAsync(id);
            if (user == null)
            {
                return NoContent();
            }
            return user;
        }

        /// <summary>
        /// GET: api/User/check/5
        /// Check if the user exists
        /// </summary>
        /// <param name="id">UID</param>
        /// <returns>Found user</returns>
        [HttpGet("check/{id}")]
        public async Task<ActionResult<User>> checkIfUserExists(string id)
        {
            var user = await _context.User.FindAsync(id);   // from DB
            User newUser = (User)HttpContext.Items["user"]; // from OAM
            if (user == null)   // IF USER DOESN'T EXIST, CREATE IT.
            {
                newUser.CreatedAt = DateTime.Now;
                newUser.UpdatedAt = DateTime.Now;
                await PostUser(newUser);
            } else  // IF USER DOES EXIST, CHECK TO SEE IF IT NEEDS TO UPDATE A VALUE
            {
                var userDb = GetUser(id).Result.Value;  // from DB
                var email = newUser.Email ?? "NOT_FOUND";
                if (email.ToString() == "NOT_FOUND")
                {
                    Console.WriteLine("DB Value contains valid email. OAM does not contain valid email. OAM Does not override DB with invalid email.");
                    newUser.Email = userDb.Email;
                }
                var rolecode = userDb.GetType().GetProperty("RoleCode").GetValue(userDb);
                newUser.RoleCode = int.Parse(rolecode.ToString());
                HttpContext.Items["userAll"] = newUser;

                foreach (var at in newUser.GetType().GetProperties())
                {
                    var currentVal = at.GetValue(newUser) ?? "NOT_FOUND";   // Leaving this here as a safeguard
                    var dbVal = userDb.GetType().GetProperty(at.Name).GetValue(userDb) ?? "NOT_FOUND";

                    // If not a datetime type and if a attribute isn't equal (meaning it has changed since last page visit), then update.
                    if (!(currentVal.Equals(dbVal)) && at.PropertyType != typeof(DateTime) && at.Name != "RoleCode")    // might not need rolecode check after I fix context update.
                    {
                        Console.WriteLine(at.Name + " IS DIFFERENT THAN DB VALUE");
                        newUser.CreatedAt = (DateTime)userDb.GetType().GetProperty("CreatedAt").GetValue(userDb);
                        newUser.UpdatedAt = DateTime.Now;
                        foreach (var entry in _context.ChangeTracker.Entries().ToList())
                        {
                            _context.Entry(entry.Entity).State = EntityState.Detached;
                        }
                        await PutUser(id, newUser);
                        Console.WriteLine("User updated.");
                        break;
                    }
                }
            }
            return user;
        }

      [HttpGet("FlagInfo")]
      public async Task<object> GetAllFlags()
      {
         var distinctLocations = await _context.User
            .Where(user => user.LocationCode != null)
            .Select(user => user.LocationCode)
            .Distinct()
            .ToListAsync();

         var distinctJobCodes = await _context.User
            .Where(user => user.JobRoleCode != null)
            .Select(user => user.JobRoleCode)
            .Distinct()
            .ToListAsync();

         var distinctJobGroups = await _context.User
            .Where(user => user.JobGroup != null)
            .Select(user => user.JobGroup)
            .Distinct()
            .ToListAsync();

         var distinctDepartments = await _context.User
            .Where(user => user.Department != null)
            .Select(user => user.Department)
            .Distinct()
            .ToListAsync();

         var distinctCostCenters = await _context.User
            .Where(user => user.CostCenter != null)
            .Select(user => user.CostCenter)
            .Distinct()
            .ToListAsync();

         return new { distinctLocations, distinctJobCodes, distinctJobGroups, distinctDepartments, distinctCostCenters };
         //return await _context.User
         // .Select(x => new
         // {
         //    x.LocationCode,
         //    x.JobRoleCode,
         //    x.JobGroup,
         //    x.Department,
         //    x.CostCenter
         // })
         // .ToListAsync();
      }

        /// <summary>
        /// PUT: api/User/5
        /// Update a particular user
        /// </summary>
        /// <param name="id">UID of user to update</param>
        /// <param name="user">New user model to replace with old model</param>
        /// <returns>Updated user</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(string id, User user)
        {
            if (id != user.UID)
            {
                return BadRequest();
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// POST: api/User
        /// Create a new user
        /// </summary>
        /// <param name="user">New user to create in database table</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.User.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.UID }, user);
        }

        /// <summary>
        /// DELETE: api/User/5
        /// Delete a user from the database
        /// </summary>
        /// <param name="id">UID of user to delete</param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<User>> DeleteUser(string id)
        {
            var user = await _context.User.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.User.Remove(user);
            await _context.SaveChangesAsync();

            return user;
        }

        /// <summary>
        /// Check if user exists in table or not given the users UID
        /// </summary>
        /// <param name="id">UID of user to search for</param>
        /// <returns></returns>
        private bool UserExists(string id)
        {
            return _context.User.Any(e => e.UID == id);
        }

        /// <summary>
        /// Using an orderd array of search querys, returns a list of users
        /// which match the querys by the desired column names array
        /// </summary>
        /// <param name="tokenStrings">the search string</param>
        /// <param name="columnNames"> should be set to one 
        /// of the column identifiers of the User table
        /// </param>
        /// <remarks>If you change the names of these parameters, change the matching api call
        /// in user.service.ts</remarks>
        /// <returns></returns>
        [HttpGet("search")]
        public ActionResult<IEnumerable<User>> GetUsersFromSearch([FromQuery]string[] tokenStrings, [FromQuery]string[] columnNames)
        {
            // convert the token string into tokens using regex
            Regex rx = new Regex(@"(\w+){1,}");
            // create the query using those tokens
            string queryString = @"
				SELECT u.*
				FROM [User] as u
				LEFT OUTER JOIN Role AS r
				ON r.RoleID = u.RoleCode
                WHERE ";

            for (int i = 0; i < tokenStrings.Length; i++)
            {
                MatchCollection matches = rx.Matches(tokenStrings[i]);
                foreach (Match match in matches.ToArray())
                {
                    if (columnNames[i] == "RoleCode")
                        queryString += @"r.RoleLevel LIKE '%" + match.Value + "%' AND ";
                    else
                        queryString += @"u." + columnNames[i] + " LIKE '%" + match.Value + "%' AND ";
                }
            }
            queryString = queryString.Substring(0, queryString.Length - 5); //< remove the last AND
            SqlCommand query = new SqlCommand(queryString, con);
            //query.Parameters.AddWithValue("@ID", keywordID);
            List<User> result = new List<User>();
            // attempt to run/read the query
            try
            {
                con.Open();
                query.CommandType = CommandType.Text;
                SqlDataReader rdr = query.ExecuteReader(); //< execute the query
                // read its results:
                while (rdr.Read())
                {
                    result.Add(Models.User.SQLtoUser(rdr));
                }
                con.Close();
            }
            catch (SqlException ex)
            {
                StaticFunctions.DisplaySqlException(ex);
            }
            return new ActionResult<IEnumerable<User>>(result);
        }//*/

        [HttpGet("LocDepCost")]
        public IActionResult GetAllLocation_Department_Costcenter()
        {
            string departmentQueryString = @"
                    SELECT DISTINCT Department FROM [User];";
            string costQueryString = @"
                    SELECT DISTINCT CostCenter FROM [User];";
            string locationQueryString = @"
                    SELECT DISTINCT LocationCode FROM [User];";

            SqlCommand departmentQuery = new SqlCommand(departmentQueryString, con);
            SqlCommand costQuery = new SqlCommand(costQueryString, con);
            SqlCommand locationQuery = new SqlCommand(locationQueryString, con);

            List<string> departmentResult = new List<string>();
            List<string> costResult = new List<string>();
            List<string> locationResult = new List<string>();

            Dictionary<string, List<string>> result = new Dictionary<string, List<string>>();
            result.Add("Department", new List<string>());
            result.Add("CostCenter", new List<string>());
            result.Add("Location", new List<string>());
            try
            {
                con.Open();
                departmentQuery.CommandType = CommandType.Text;
                SqlDataReader rdr = departmentQuery.ExecuteReader(); //< execute the query
                // read its results:
                while (rdr.Read())
                {
                    string res = rdr["Department"].ToString();
                    if (res != "")
                        result["Department"].Add(res);
                }
                rdr.Close();
                rdr = costQuery.ExecuteReader();
                while(rdr.Read())
                {
                    string res = rdr["CostCenter"].ToString();
                    if (res != "")
                        result["CostCenter"].Add(res);
                }
                rdr.Close();
                rdr = locationQuery.ExecuteReader();
                while (rdr.Read())
                {
                    string res = rdr["LocationCode"].ToString();
                    if (res != "")
                        result["Location"].Add(res);
                }
                con.Close();
            }
            catch (SqlException ex)
            {
                StaticFunctions.DisplaySqlException(ex);
            }
            return Ok(result);
        }
    }
}
