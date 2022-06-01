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
    public class ChangedMediaController : ControllerBase
    {
        // database connection context
        private readonly tomtcmsContext _context;
        readonly SqlConnection con;

        public ChangedMediaController(tomtcmsContext context)
        {
            _context = context;
            con = StaticFunctions.GetConnection();
        }

        [HttpGet("{changeID}")]
        public async Task<ActionResult<ChangedMedia>> GetChangedMedia(string changeID)
        {

            var log = await _context.ChangedMedia.FindAsync(int.Parse(changeID));
            if (log == null)
            {
                return NoContent();
            }

            return log;
        }

        [HttpPut]

        public async Task<IActionResult> PutChange(ChangedMedia media)
        {

            _context.Entry(media).State = EntityState.Modified;

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
        public async Task<ActionResult<AdminAuditLog>> PostChangedMedia(ChangedMedia entry)
        {
            _context.ChangedMedia.Add(entry);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetChangedMedia", new { changeID = entry.ChangeID }, entry);
        }

    }
}
