using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using united_airlines_training.Models;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Rating controller to make CRUD function calls and allow to read and write to MSSQL database
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class RatingController : ControllerBase
    {
        private readonly tomtcmsContext _context;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public RatingController(tomtcmsContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET: api/Rating/media/{mediaId}
        /// Get specific media likes and dislikes
        /// </summary>
        /// <param name="mediaId">ID of media item</param>
        /// <returns>Object result of all media likes and dislikes</returns>
        [HttpGet("media/{mediaId}")]
        public IActionResult GetMediaRatingLikes(int mediaId)
        {
            if (!MediaExists(mediaId))
            {
                return NotFound();
            }

            var likes = _context.Rating.Where(m => m.MediaID == mediaId && m.Like == true);
            var dislikes = _context.Rating.Where(m => m.MediaID == mediaId && m.Like == false);
            int likeCount = likes.Count();
            int dislikeCount = dislikes.Count();
            return Ok( new { likes = likeCount, dislikes = dislikeCount });
        }


        /// <summary>
        /// GET: api/Rating/media/1/user/1
        /// Get user rating for a particular media item
        /// </summary>
        /// <param name="mediaId">ID of media item</param>
        /// <param name="uid">ID of user</param>
        /// <returns>ActionResult of user rating on media item if one exists</returns>
        [HttpGet("media/{mediaId}/user/{uid}")]
        public async Task<ActionResult<Rating>> GetUserMediaRating(int mediaId, string uid)
        {

            if (!MediaExists(mediaId))
            {
                return NotFound();
            }

            var userRating = await _context.Rating.Where(m => m.MediaID == mediaId && m.UID == uid).ToListAsync();
            if (userRating.Count() != 1)
            {
                return NoContent();
            }
            return userRating[0];
        }

        /// <summary>
        /// GET: api/Rating
        /// Get all ratings in Rating table
        /// </summary>
        /// <returns>ActionResult of all ratings in table</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rating>>> GetRating()
        {
            return await _context.Rating.ToListAsync();
        }

        /// <summary>
        /// GET: api/Rating/user/5
        /// Get all user ratings
        /// </summary>
        /// <param name="id">ID of user</param>
        /// <returns>List of all user ratings</returns>
        [HttpGet("user/{id}")]
        public async Task<ActionResult<IEnumerable<Rating>>> GetAllUserRating(string id)
        {
            var userRating = await _context.Rating.Where(m => m.UID == id).ToListAsync();

            if (userRating == null)
            {
                return NoContent();
            }

            return userRating;
        }

        /// <summary>
        /// GET: api/Rating/user/5/media/5
        /// Get specific rating for a user on a particular media item
        /// </summary>
        /// <param name="mediaId">ID of media item</param>
        /// <param name="id">ID of user</param>
        /// <returns>ActionResult of user rating for a media item</returns>
        [HttpGet("user/{id}/media/{mediaId}")]
        public async Task<ActionResult<Rating>> GetRating(string id, int mediaId)
        {
            var rating = await _context.Rating.FindAsync(id, mediaId);

            if (rating == null)
            {
                return NotFound();
            }

            return rating;
        }


        /// <summary>
        /// PUT: api/Rating/user/5/media/5
        /// Update a specific user rating for a media item
        /// </summary>
        /// <param name="mediaId">ID of media item</param>
        /// <param name="id">ID of user</param>
        /// <param name="rating">Rating object to update to in the database</param>
        /// <returns></returns>
        [HttpPut("user/{id}/media/{mediaId}")]
        public async Task<IActionResult> PutRating(string id, int mediaId, Rating rating)
        {
            if (id != rating.UID)
            {
                return BadRequest();
            }

            _context.Entry(rating).State = EntityState.Modified;
            _context.Entry(rating).Property(p => p.CreatedAt).IsModified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RatingExists(id, mediaId))
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
        /// POST: api/Rating
        /// Create a new rating
        /// </summary>
        /// <returns>Newly created rating</returns>
        [HttpPost]
        public async Task<ActionResult<Rating>> PostRating(Rating rating)
        {
            _context.Rating.Add(rating);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RatingExists(rating.UID, rating.MediaID))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetRating", new { id = rating.UID }, rating);
        }

        /// <summary>
        /// DELETE: api/Rating/user/5/media/5
        /// Delete a user rating
        /// </summary>
        /// <param name="mediaId">ID of media item</param>
        /// <param name="id">ID of user</param>
        /// <returns></returns>
        [HttpDelete("user/{id}/media/{mediaId}")]
        public async Task<ActionResult<Rating>> DeleteRating(string id, int mediaId)
        {
            var rating = await _context.Rating.FindAsync(id, mediaId);
            if (rating == null)
            {
                return NotFound();
            }

            _context.Rating.Remove(rating);
            await _context.SaveChangesAsync();

            return rating;
        }

        /// <summary>
        /// Check if the media ID is contained in the media table (if it exists)
        /// </summary>
        /// <returns>Boolean to determine if media item exists</returns>
        private bool MediaExists(int mediaID)
        {
            return _context.Media.Any(e => e.MediaID == mediaID);
        }

        /// <summary>
        /// Check if the rating exists in the rating table given the media ID and user ID
        /// </summary>
        /// <returns>Boolean to determine if rating exists in database</returns>
        private bool RatingExists(string id, int mediaid)
        {
            return _context.Rating.Any(e => e.UID == id && e.MediaID == mediaid);
        }
    }
}
