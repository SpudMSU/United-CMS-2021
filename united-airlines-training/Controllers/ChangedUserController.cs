using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using united_airlines_training.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace united_airlines_training.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChangedUserController : ControllerBase
    {
        // database connection context
        private readonly tomtcmsContext _context;
        readonly SqlConnection con;

        public ChangedUserController(tomtcmsContext context)
        {
            _context = context;
            con = StaticFunctions.GetConnection();
        }

        [HttpGet("{changeID}")]
        public async Task<ActionResult<ChangedUser>> GetChangedUser(string changeID)
        {

            var log = await _context.ChangedUser.FindAsync(int.Parse(changeID));
            if (log == null)
            {
                return NoContent();
            }

            return log;
        }

        [HttpPut]

        public async Task<IActionResult> PutChange(ChangedUser user)
        {

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException)
            {
                throw;
            }

            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<AdminAuditLog>> PostChangedUser(ChangedUser entry)
        {
            _context.ChangedUser.Add(entry);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetChangedUser", new { changeID = entry.ChangeID }, entry);
        }

    }
}
