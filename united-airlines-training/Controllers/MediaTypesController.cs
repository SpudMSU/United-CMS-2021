using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using united_airlines_training.Models;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: N/A
    /// This controller may not be used anywhere right now (not sure)
    /// -
    /// Interacts with the SQL Server database's media type entities.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class MediaTypesController : ControllerBase
    {
        // database connection context
        private readonly tomtcmsContext _context;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public MediaTypesController(tomtcmsContext context)
        {
            _context = context;
        }

        // GET: api/MediaTypes
        /// <summary>
        /// Get all media types
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaType>>> GetMediaType()
        {
            return await _context.MediaType.ToListAsync();
        }

        // GET: api/MediaTypes/5
        /// <summary>
        /// getter for a specific media type
        /// </summary>
        /// <param name="id"></param>
        /// <remarks>Changes to this function must be reflected
        /// in the PostMediaType function</remarks>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<MediaType>> GetMediaType(int id)
        {
            var mediaType = await _context.MediaType.FindAsync(id);

            if (mediaType == null)
            {
                return NotFound();
            }

            return mediaType;
        }

        // PUT: api/MediaTypes/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        /// <summary>
        /// Update a media type in the database
        /// </summary>
        /// <param name="id">original id of the updating type</param>
        /// <param name="mediaType">new data to record for the existing media type</param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMediaType(int id, MediaType mediaType)
        {
            if (id != mediaType.Id)
            {
                return BadRequest();
            }

            _context.Entry(mediaType).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MediaTypeExists(id))
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

        // POST: api/MediaTypes
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        /// <summary>
        /// Add a new media type to the database 
        /// </summary>
        /// <param name="mediaType">data for the new media type record (ID of this will be automatically changed)</param>
        /// <returns>the inputted media type data as it appears in the database (with updated id)</returns>
        [HttpPost]
        public async Task<ActionResult<MediaType>> PostMediaType(MediaType mediaType)
        {
            _context.MediaType.Add(mediaType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMediaType", new { id = mediaType.Id }, mediaType);
        }

        // DELETE: api/MediaTypes/5
        /// <summary>
        /// Remove the media type with the given ID from the database
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<MediaType>> DeleteMediaType(int id)
        {
            var mediaType = await _context.MediaType.FindAsync(id);
            if (mediaType == null)
            {
                return NotFound();
            }

            _context.MediaType.Remove(mediaType);
            await _context.SaveChangesAsync();

            return mediaType;
        }

        /// <summary>
        /// True if there is a media type in the database that has the provided ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private bool MediaTypeExists(int id)
        {
            return _context.MediaType.Any(e => e.Id == id);
        }
    }
}
