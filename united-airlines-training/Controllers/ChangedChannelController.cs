using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using System.Linq;
using united_airlines_training.Models;
using System.Data;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace united_airlines_training.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChangedChannelController : ControllerBase
    {
        // database connection context
        private readonly tomtcmsContext _context;
        readonly SqlConnection con;

        public ChangedChannelController(tomtcmsContext context)
        {
            _context = context;
            con = StaticFunctions.GetConnection();
        }

        [HttpGet("{changeID}")]
        public async Task<ActionResult<ChangedChannel>> GetChangedChannel(string changeID)
        {


            var log = await _context.ChangedChannel.FindAsync(int.Parse(changeID));
            if (log == null)
            {
                return NoContent();
            }

            return log;
        }

        [HttpPut]

        public async Task<IActionResult> PutChange(ChangedChannel channel)
        {

            _context.Entry(channel).State = EntityState.Modified;

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
        public async Task<ActionResult<AdminAuditLog>> PostChangedChannel(ChangedChannel entry)
        {
            _context.ChangedChannel.Add(entry);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetChangedChannel", new { changeID = entry.ChangeID }, entry);
        }

    }
}
