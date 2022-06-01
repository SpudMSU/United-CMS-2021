using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using united_airlines_training.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;
using System.Data;
using System.Text.RegularExpressions;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: Shawn
    /// -
    /// Interface for getting channel information from the database
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ChannelController : Controller
    {
        private readonly tomtcmsContext _context;
        readonly SqlConnection con;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public ChannelController(tomtcmsContext context)
        {
            _context = context;
            // needed to run complex queries to the database
            con = StaticFunctions.GetConnection();
        }

        /// <summary>
        /// Getter for all channels which do not have a parent
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public IActionResult GetRootChannels()
        {
            SqlCommand query = new SqlCommand(@"
                SELECT ch.*
                FROM Channel as ch
                LEFT OUTER JOIN NestedChannel nc ON ch.ChannelID = nc.ChildID
                WHERE nc.ChildID IS NULL
                ORDER BY ch.Title
			", con);
            List<Channel> result = new List<Channel>();
            // attempt to run/read the query
            try
            {
                con.Open();
                query.CommandType = CommandType.Text;
                SqlDataReader rdr = query.ExecuteReader(); //< execute the query
                // read its results:
                while (rdr.Read())
                {
                    result.Add(Channel.SQLToChannel(rdr));
                }
                con.Close();
            }
            catch (SqlException ex)
            {
                for (int i = 0; i < ex.Errors.Count; i++)
                {
                    Console.WriteLine($"Index # {i} Error: {ex.Errors[i]}");
                }
            }
            return Ok(result);
        }

        /// <summary>
        /// Gets the list of all Channels within the database
        /// </summary>
        /// <returns></returns>
        [HttpGet("all/")]
        public async Task<ActionResult<IEnumerable<Channel>>> GetAllChannels()
        {
            var res = await _context.Channel.ToListAsync();
            return res;
        }

        /// <summary>
        /// Gets a specific Channel from the database
        /// </summary>
        /// <param name="channelID">ID of the channel we want</param>
        /// <returns></returns>
        /// Note: Changes made to this function signature will need to be manually
        /// reflected in the CreateChannel function
        [HttpGet("{channelID}")]
        public async Task<ActionResult<Channel>> GetChannel(int channelID)
        {
            var channel = await _context.Channel.FindAsync(channelID);
            if (channel == null)
            {
                return NotFound();
            }
            return channel;
        }

        /// <summary>
        /// Modify an existing Channel entry
        /// in our database
        /// </summary>
        /// <param name="id">id of the Channel being updated</param>
        /// <param name="channel">The modified entry to update</param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChannel(int id, Channel channel) //[FromBody]
        {
            if (id != channel.ChannelID)
            {
                return BadRequest();
            }

            _context.Entry(channel).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChannelExists(channel.ChannelID))
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
        /// Add the provided Channel instance to the database
        /// </summary>
        /// <param name="channel"></param>
        /// <returns>The created channel (if created successfully)</returns>
        [HttpPost]
        public async Task<ActionResult<Channel>> CreateChannel(Channel channel) // [FromBody] 
        {
            _context.Channel.Add(channel);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ChannelExists(channel.ChannelID)) // item with the same ID already exists
                {
                    return Conflict();
                }
                else { throw; }
            }
            return CreatedAtAction("GetChannel", new { mediaId = channel.ChannelID }, channel);
        }
        [HttpPost("revert")]
        public async Task<ActionResult<Channel>> reCreateChannel(Channel channel) // [FromBody] 
        {
            string queryString = @"SET IDENTITY_INSERT Channel ON; 
                                   insert into Channel (ChannelID, Title, Description, Icon) 
                                    VALUES(" + channel.ChannelID + ", '" + channel.Title + "', '" + channel.Description + "', '" + channel.Icon + "');";
            con.Open();
            SqlCommand query = new SqlCommand(queryString, con);
            try
            {
                if (con.State == ConnectionState.Closed)
                {
                    con.Open();
                }
                query.CommandType = CommandType.Text;
                SqlDataReader rdr = query.ExecuteReader(); //< execute the query
                                                           // read its results:
                con.Close();

            }
            catch
            {
                if (ChannelExists(channel.ChannelID)) // item with the same ID already exists
                {
                    return Conflict();
                }
                else { throw; }
            }
            return CreatedAtAction("GetChannel", new { mediaId = channel.ChannelID }, channel);
        }

        /// <summary>
        /// Removes a Channel entry from the database table
        /// </summary>
        /// <param name="channelID">id of the entry to remove</param>
        /// <returns></returns>
        [HttpDelete("{channelID}")]
        public async Task<ActionResult<Channel>> DeleteChannel(int channelID)
        {
            var channel = await _context.Channel.FindAsync(channelID);
            try
            {
                
                if (channel == null)
                {
                    return NotFound();
                }

                _context.Channel.Remove(channel);
                await _context.SaveChangesAsync();

                // attempt to remove all nesting relationships
                NestedChannelController ncc = new NestedChannelController(_context);
                await ncc.DeleteChannelRelationships(channelID);

            }catch (Exception e)
            {


            }
            return channel;
        }

        /// <summary>
        /// Returns true if there exists an entry in the database
        /// Channel table with the provided id
        /// </summary>
        /// <param name="channelID"></param>
        /// <returns></returns>
        private bool ChannelExists(int channelID)
        {
            return _context.Channel.Any(e => e.ChannelID == channelID);
        }

        /// <summary>
        /// Getter for the list of media items associated with a 
        /// specified channel
        /// </summary>
        /// <param name="channelID"></param>
        /// <returns></returns>
        [HttpGet("media/{channelID}")]
        public async Task<ActionResult<IEnumerable<MediaItem>>> GetMediaOfChannel(int channelID)
        {
            if (!ChannelExists(channelID))
            {
                return NotFound();
            }
            // get all of their IDS
            var mediaconnections = await _context.MediaToChannel.Where(m => m.ChannelID == channelID).ToListAsync();

            // get the list of items
            List<MediaItem> items = new List<MediaItem>();
            foreach(var mcCon in mediaconnections)
            {
                var media = await _context.Media.FindAsync(mcCon.MediaID);
                if (media != null)
                {
                    if(media.MediaStatus == "A")
                        items.Add(media);
                }
            }
            return new ActionResult<IEnumerable<MediaItem>>(items);
        }

        [HttpGet("getParent/{parentID}")]
        public async Task<IEnumerable<Channel>> GetChannelsOnLevel(int parentID=-1)
        {
            IEnumerable<Channel> result = Enumerable.Empty<Channel>();
            NestedChannelController ncc = new NestedChannelController(_context);
            if (parentID != -1)
            {
                IEnumerable<Channel> channels = ncc.GetChildren(parentID).Result.Value;
                return channels;
            }
            else
            {
                IEnumerable<Channel> channels = ncc.getBaseChannels().Result;
                return channels;
            }
        }

        /// <summary>
        /// Add a media item to this channel's list
        /// of media
        /// </summary>
        /// <param name="channelID"></param>
        /// <param name="media"></param>
        /// <returns></returns>
        [HttpPost("addMedia/{channelID}")]
        public async Task<IActionResult> AddMediaToChannel(int channelID, MediaItem media)
        {
            if (!ChannelExists(channelID))
            {
                return NotFound();
            }
            _context.MediaToChannel.Add(new MediaToChannel() { ChannelID = channelID, MediaID = media.MediaID });
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw;
            }
            return NoContent();
        }

        /// <summary>
        /// Remove a media item from a channel's list of media
        /// </summary>
        /// <param name="channelID"></param>
        /// <param name="mediaID"></param>
        /// <returns></returns>
        [HttpDelete("removeMedia/{channelID}/{mediaID}")]
        public async Task<ActionResult<MediaToChannel>> DeleteMediaFromChannel(int channelID, int mediaID)
        {
            var rel = await _context.MediaToChannel.FindAsync(mediaID, channelID);
            if (rel == null)
            {
                Console.WriteLine("test + " + mediaID + " " + channelID);
                return NotFound();
            }

            _context.MediaToChannel.Remove(rel);
            await _context.SaveChangesAsync();

            return rel;
        }

        /// <summary>
        /// Using a given search query, returns a list of channels
        /// items which match the query by title 
        /// in the database
        /// </summary>
        /// <param name="tokenString">the search string</param>
        /// <returns></returns>
        [HttpGet("search/{tokenString}")]
        public ActionResult<IEnumerable<Channel>> GetChannelFromSearch(string tokenString)
        {
            // convert the token string into tokens using regex
            Regex rx = new Regex(@"(\w+){3,}");
            MatchCollection matches = rx.Matches(tokenString);
            // create the query using those tokens
            string queryString = @"
				SELECT c.*
                FROM Channel as c
                WHERE ";
            foreach (Match match in matches.ToArray())
            {
                queryString += @"c.Title LIKE '%" + match.Value + "%' AND ";
            }
            queryString = queryString.Substring(0, queryString.Length - 5); //< remove the last AND
            SqlCommand query = new SqlCommand(queryString, con);
            List<Channel> result = new List<Channel>();
            // attempt to run/read the query
            try
            {
                con.Open();
                query.CommandType = CommandType.Text;
                SqlDataReader rdr = query.ExecuteReader(); //< execute the query
                // read its results:
                while (rdr.Read())
                {
                    result.Add(Channel.SQLToChannel(rdr));
                }
                con.Close();
            }
            catch (SqlException ex)
            {
                StaticFunctions.DisplaySqlException(ex);
            }
            return new ActionResult<IEnumerable<Channel>>(result);
        }

    }
}
