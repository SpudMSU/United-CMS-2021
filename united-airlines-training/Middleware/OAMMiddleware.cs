using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using united_airlines_training.Models;

namespace united_airlines_training.Middleware
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Middleware class for handling request headers from OAM
    /// </summary>

    public class OAMMiddleware
    {
        private readonly RequestDelegate _next;

        public OAMMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext httpContext)
        {
            IHeaderDictionary headers = httpContext.Request.Headers;
            var path = httpContext.Request.Path;

            string authHeader = httpContext.Request.Headers["Authorization"];
            if (authHeader != null && authHeader.StartsWith("Basic"))
            {
                // Below is a user object that gets it's attributes from OAM (all header information)
                var user = new User()
                {
                    UID = httpContext.Request.Headers["x-uid"],
                    FirstName = httpContext.Request.Headers["x-givenName"],
                    LastName = httpContext.Request.Headers["x-sn"],
                    Email = httpContext.Request.Headers["x-mail"],
                    EmploymentStatus = httpContext.Request.Headers["x-employeeStatus"],
                    Company = httpContext.Request.Headers["x-company"],
                    RoleCode = 1,   // Default role code will be overriden on application load if user exists in DB
                    JobRoleCode = httpContext.Request.Headers["x-jobCode"],
                    JobGroup = httpContext.Request.Headers["x-ualJobGroup"],
                    OccupationTitle = httpContext.Request.Headers["x-ualJobCodeDesc"],
                    Department = httpContext.Request.Headers["x-ualDepartment"],
                    LocationCode = httpContext.Request.Headers["x-L"],
                    CostCenter = httpContext.Request.Headers["x-ualCostCenter"],
                    CostCenterDesc = httpContext.Request.Headers["x-ualCostCenterDesc"],
                };

                // Might not need this encoding below since OAM handles authentication
                string encodedUsernamePassword = authHeader.Substring("Basic ".Length).Trim();
                Encoding encoded = Encoding.GetEncoding("iso-8859-1");
                string usernamePassword = encoded.GetString(Convert.FromBase64String(encodedUsernamePassword));
                int seperatorIndex = usernamePassword.IndexOf(':');

                string uid = usernamePassword.Substring(0, seperatorIndex);
                if (user.UID == uid)
                {
                    if (httpContext.Items.ContainsKey("user"))
                        httpContext.Items["user"] = user;
                    else
                        httpContext.Items.Add("user", user);
                        
                    httpContext.Response.Headers.Add("uid", uid);
                }
                else
                {
                    httpContext.Response.StatusCode = 401;
                    return;
                }
            }
            else // Will enter if the modheader is turned off or user becomes unauthorized (maybe due to a timeout)
            {
                Console.WriteLine("UNAUTHORIZED.");
                httpContext.Response.StatusCode = 401;
                return;
            }

            await _next(httpContext);
        }
    }

    // Extension method used to add the middleware to the HTTP request pipeline.
    public static class OAMMiddlewareExtensions
    {
        public static IApplicationBuilder UseOAMMiddleware(this IApplicationBuilder appBuilder, OAMHeaderBuilder oamBuilder)
        {
            OAMHeaderPolicy policy = oamBuilder.Build();
            return appBuilder.UseMiddleware<OAMMiddleware>(policy);
        }
    }
}
