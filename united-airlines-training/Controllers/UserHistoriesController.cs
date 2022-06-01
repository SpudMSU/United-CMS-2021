using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using united_airlines_training.Models;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// Interacts with the SQL Server database to get specific
    /// UserHistory instances
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UserHistoriesController : ControllerBase
    {
        // database connection context
        private readonly tomtcmsContext _context;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public UserHistoriesController(tomtcmsContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Getter for the List of user histories which apply to a specific media item
        /// </summary>
        /// <param name="mediaID">id of the item to get viewing history for</param>
        /// <returns>list of view histories</returns>
        [HttpGet("{mediaID}")]
        public async Task<ActionResult<IEnumerable<UserHistory>>> GetMediaHistory(int mediaID)
        {
            if (!MediaExists(mediaID))
            {
                return NotFound();
            }

            var mediaHistory = await _context.UserHistory.Where(m => m.MediaID == mediaID).ToListAsync();
            return mediaHistory;
        }

        /// <summary>
        /// Get the total number of times a specific media
        /// has been clicked on (viewed)
        /// </summary>
        /// <param name="mediaID"></param>
        /// <returns>integer sum of clicks</returns>
        [HttpGet("{mediaID}/Views")]
        public IActionResult GetMediaViews(int mediaID)
        {
            if (!MediaExists(mediaID))
            {
                return NotFound();
            }

            var mediaHistory = _context.UserHistory.Where(m => m.MediaID == mediaID).ToList();
            return Ok(new { totalViews = mediaHistory.Sum(p => p.ClickedAmount) });
        }


        /// <summary>
        /// Gets the list of all User histories within the database
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserHistory>>> GetAllUserHistories()
        {
            return await _context.UserHistory.ToListAsync();
        }


        /// <summary>
        /// Gets a specific User history from the database
        /// </summary>
        /// <param name="UID">the user who's history we are searching through</param>
        /// <param name="mediaID">the item within that history we want to find</param>
        /// <returns></returns>
        /// Note: Changes made to this function signature will need to be manually
        /// reflected in the PostUserHistory function
        [HttpGet("{UID}/{mediaID}")]
        public async Task<ActionResult<UserHistory>> GetUserHistory(string UID, int mediaID)
        {
            var uHistoryInstance = await _context.UserHistory.FindAsync(UID, mediaID);

            if (uHistoryInstance == null)
            {
                return NoContent();
            }

            return uHistoryInstance;
        }

        /// <summary>
        /// Modify an existing UserHistory entry
        /// in our database
        /// </summary>
        /// <param name="uHist">The modified entry to update</param>
        /// <returns></returns>
        [HttpPut]
        public async Task<IActionResult> PutUserHistory([FromBody] UserHistory uHist)
        {
            _context.Entry(uHist).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserHistoryExists(uHist.UID, uHist.MediaID))
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
        /// Add the provided User History instance to the database
        /// </summary>
        /// <param name="userHistory"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<ActionResult<UserHistory>> PostUserHistory([FromBody] UserHistory userHistory)
        {
            _context.UserHistory.Add(userHistory);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUserHistory", new { UID = userHistory.UID, mediaId = userHistory.MediaID }, userHistory);
        }

        /// <summary>
        /// Removes a user history entry from the database table
        /// </summary>
        /// <param name="UID">userid of the entry to remove</param>
        /// <param name="mediaId">mediaid of the entry to remove</param>
        /// <returns></returns>
        [HttpDelete("{UID}/{mediaID}")]
        public async Task<ActionResult<UserHistory>> DeleteUserHistory(int UID, int mediaId)
        {
            var userHistory = await _context.UserHistory.FindAsync(UID, mediaId);
            if (userHistory == null)
            {
                return NotFound();
            }

            _context.UserHistory.Remove(userHistory);
            await _context.SaveChangesAsync();

            return userHistory;
        }

        /// <summary>
        /// Returns true if there exists an entry in the database
        /// UserHistory table with the provided
        /// uid and mediaid
        /// </summary>
        /// <param name="uid"></param>
        /// <param name="mediaid"></param>
        /// <returns></returns>
        private bool UserHistoryExists(string uid, int mediaid)
        {
            return _context.UserHistory.Any(e => e.UID == uid && e.MediaID == mediaid);
        }

        /// <summary>
        /// Returns true if the database contains a 
        /// media record with the provided id
        /// </summary>
        /// <param name="mediaID"></param>
        /// <returns></returns>
        private bool MediaExists(int mediaID)
        {
            return _context.Media.Any(e => e.MediaID == mediaID);
        }
    }
}
