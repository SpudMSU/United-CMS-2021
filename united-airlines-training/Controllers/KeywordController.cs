using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using united_airlines_training.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;
using System.Data;

namespace united_airlines_training.Controllers
{
	/// <summary>
	/// Author: Shawn Pryde
	/// -
	/// Controller for handling http requests
	/// to get keyword based results from our database
	/// </summary>
	[Route("api/[controller]")]
	[ApiController]
	public class KeywordController : ControllerBase
	{
		// database connection context
		private readonly tomtcmsContext _context;
		readonly SqlConnection con;

		/// <summary>
		/// Constructor
		/// </summary>
		/// <param name="context">Azure Database context used to connect to SQL Server</param>
		public KeywordController(tomtcmsContext context)
		{
			_context = context;
			con = StaticFunctions.GetConnection();
		}

		/// <summary>
		/// Getter for the list of all keywords in the database
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public async Task<ActionResult<IEnumerable<Keyword>>> GetAllKeywords()
		{
			return await _context.Keyword.ToListAsync();
		}

		/// <summary>
		/// Getter for a specific Keyword by its ID
		/// </summary>
		/// <param name="keywordID"></param>
		/// <remarks>Changes to this function must be reflected
		/// in the CreateKeyword function</remarks>
		/// <returns></returns>
		public async Task<ActionResult<Keyword>> GetKeyword(int keywordID)
		{
			var k = await _context.Keyword.FindAsync(keywordID);
			if (k == null)
			{
				return NotFound();
			}
			return k;
		}

		/// <summary>
		/// Getter for a keyword based on its word column
		/// </summary>
		/// <param name="word"></param>
		/// <returns></returns>
		[HttpGet("byWord/{word}")]
		public async Task<ActionResult<Keyword>> GetKeywordByWord(string word)
		{
			var k = await _context.Keyword.Where(kw => kw.Word == word).ToArrayAsync();
			if (k.Length != 1)
			{
				return null;
			}
			return new ActionResult<Keyword>(k[0]);
		}

		/// <summary>
		/// Modify an existing keyword entry
		/// in our database
		/// </summary>
		/// <param name="id">id of the Keyword being updated</param>
		/// <param name="keyword">The modified entry to update</param>
		/// <returns></returns>
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateKeyword(int id, Keyword keyword) //[FromBody]
		{
			if (id != keyword.ID)
			{
				return BadRequest();
			}

			_context.Entry(keyword).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!KeywordExists(keyword.ID))
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
		/// Add the provided Keyword instance to the database
		/// </summary>
		/// <param name="keyword"></param>
		/// <returns>True if the keyword was created successfully</returns>
		[HttpPost]
		public async Task<ActionResult<Keyword>> CreateKeyword(Keyword keyword) // [FromBody] 
		{
			_context.Keyword.Add(keyword);
			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateException)
			{
				if (KeywordExists(keyword.ID)) // item with the same ID already exists
				{
					return Conflict();
				}
				else { throw; }
			}
			return CreatedAtAction("GetKeyword", new { mediaId = keyword.ID }, keyword);
		}

		/// <summary>
		/// Removes a Keyword entry from the database table
		/// </summary>
		/// <param name="keywordID">id of the entry to remove</param>
		/// <returns></returns>
		[HttpDelete("{keywordID}")]
		public async Task<ActionResult<Keyword>> DeleteKeyword(int keywordID)
		{
			var keyword = await _context.Keyword.FindAsync(keywordID);
			if (keyword == null)
			{
				return NotFound();
			}

			_context.Keyword.Remove(keyword);
			await _context.SaveChangesAsync();

			return keyword;
		}
		/// <summary>
		/// Returns true if there exists an entry in the database
		/// keyword table with the provided id
		/// </summary>
		/// <param name="keywordID"></param>
		/// <returns></returns>
		private bool KeywordExists(int keywordID)
		{
			return _context.Keyword.Any(e => e.ID == keywordID);
		}

		/// <summary>
		/// Getter for all channels associated
		/// with the provided keywordID
		/// </summary>
		/// <param name="keywordID"></param>
		/// <returns></returns>
		[HttpGet("channels/{keywordID}")]
		public IActionResult GetChannelsWithKeyword(int keywordID)
		{
			SqlCommand query = new SqlCommand(@"
				SELECT ch.*
				FROM ChannelKeyword as chWord
				LEFT OUTER JOIN Channel as ch ON ch.ChannelID = chWord.ChannelID
				WHERE chWord.KeywordID = @ID
				ORDER BY ch.Title
			", con);
			// set the query to replace all "@ID"s with the passed in keywordID
			query.Parameters.AddWithValue("@ID", keywordID);
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
			return Ok(result);
		}

		/// <summary>
		/// Getter for all media items associated
		/// with the provided keywordID
		/// </summary>
		/// <param name="keywordID"></param>
		/// <returns></returns>
		[HttpGet("media/{keywordID}")]
		public IActionResult GetMediaWithKeyword(int keywordID)
		{
			SqlCommand query = new SqlCommand(@"
				SELECT m.*
				FROM MediaKeyword as mWord
				LEFT OUTER JOIN Media as m ON m.MediaID = mWord.MediaID
				WHERE mWord.KeywordID = @ID
				ORDER BY m.Title
			", con);
			// set the query to replace all "@ID"s with the passed in keywordID
			query.Parameters.AddWithValue("@ID", keywordID);
			List<MediaItem> result = new List<MediaItem>();
			// attempt to run/read the query
			try
			{
				con.Open();
				query.CommandType = CommandType.Text;
				SqlDataReader rdr = query.ExecuteReader(); //< execute the query
				// read its results:
				while (rdr.Read())
				{
					result.Add(MediaItem.SQLToMediaItem(rdr));
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
		/// Getter for all keywords associated
		/// with the provided mediaID
		/// </summary>
		/// <param name="mediaID"></param>
		/// <returns>an IActionResult of a list of keywords</returns>
		[HttpGet("keywordsOfMedia/{mediaID}")]
		public async Task<ActionResult<IEnumerable<Keyword>>> GetKeywordsOfMedia(int mediaID)
		{
			SqlCommand query = new SqlCommand(@"
				SELECT k.*
				FROM Keyword as k
				LEFT OUTER JOIN MediaKeyword as m ON m.KeywordID = k.ID
				WHERE m.MediaID = @ID
				ORDER BY k.Word
			", con);
			// set the query to replace all "@ID"s with the passed in mediaID
			query.Parameters.AddWithValue("@ID", mediaID);
			List<Keyword> result = new List<Keyword>();
			// attempt to run/read the query
			try
			{
				con.Open();
				query.CommandType = CommandType.Text;
				SqlDataReader rdr = query.ExecuteReader(); //< execute the query
				// read its results:
				while (rdr.Read())
				{
					result.Add(Keyword.SQLToKeyword(rdr));
				}
				con.Close();
			}
			catch (SqlException ex)
			{
				StaticFunctions.DisplaySqlException(ex);
			}
			return new ActionResult<IEnumerable<Keyword>>(result);
		}

		/// <summary>
		/// Getter for all keywords associated
		/// with the provided channelID
		/// </summary>
		/// <param name="channelID"></param>
		/// <returns></returns>
		[HttpGet("keywordsOfChannel/{channelID}")]
		public IActionResult GetKeywordsOfChannel(int channelID)
		{
			SqlCommand query = new SqlCommand(@"
				SELECT k.*
				FROM Keyword as k
				LEFT OUTER JOIN ChannelKeyword as c ON c.KeywordID = k.ID
				WHERE c.ChannelID = @ID
				ORDER BY k.Word
			", con);
			// set the query to replace all "@ID"s with the passed in mediaID
			query.Parameters.AddWithValue("@ID", channelID);
			List<Keyword> result = new List<Keyword>();
			// attempt to run/read the query
			try
			{
				con.Open();
				query.CommandType = CommandType.Text;
				SqlDataReader rdr = query.ExecuteReader(); //< execute the query
				// read its results:
				while (rdr.Read())
				{
					result.Add(Keyword.SQLToKeyword(rdr));
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
		/// Adds the specified keyword to the specified media's list of keywords
		/// </summary>
		/// <param name="keywordID"></param>
		/// <param name="mediaID"></param>
		/// <returns>True if the association was created successfully</returns>
		[HttpPost("addKeyword/media/{mediaID}/{keywordID}")]
		public async Task<ActionResult<bool>> AddKeywordToMedia(int mediaID, int keywordID) // [FromBody] 
		{
			var newAssociation = new MediaKeyword()
			{
				MediaID = mediaID,
				KeywordID = keywordID
			};
			_context.MediaKeyword.Add(newAssociation);
			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateException)
			{
				if (_context.MediaKeyword.Any(e => e.KeywordID == keywordID && e.MediaID == mediaID)) 
				{
					return Conflict();
				}
				else { throw; }
			}
			return new ActionResult<bool>(true);
		}

		/// <summary>
		/// Remove a keyword from a media's list of keywords
		/// </summary>
		/// <param name="keywordID"></param>
		/// <param name="mediaID"></param>
		/// <returns></returns>
		[HttpDelete("removeKeyword/media/{keywordID}/{mediaID}")]
		public async Task<ActionResult<MediaKeyword>> RemoveKeywordMediaAssociation(int keywordID, int mediaID)
		{
			var rel = await _context.MediaKeyword.FindAsync(keywordID, mediaID);
			if (rel == null)
			{
				return NotFound();
			}

			_context.MediaKeyword.Remove(rel);
			await _context.SaveChangesAsync();

			return rel;
		}

		/// <summary>
		/// Adds the specified keyword to the specified channel's list of keywords
		/// </summary>
		/// <param name="keywordID"></param>
		/// <param name="channelID"></param>
		/// <returns>True if the association was created successfully</returns>
		[HttpPost("addKeyword/channel/{channelID}/{keywordID}")]
		public async Task<ActionResult<bool>> AddKeywordToChannel(int channelID, int keywordID)
		{
			var newAssociation = new ChannelKeyword()
			{
				ChannelID = channelID,
				KeywordID = keywordID
			};
			_context.ChannelKeyword.Add(newAssociation);
			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateException)
			{
				if (_context.ChannelKeyword.Any(e => e.KeywordID == keywordID && e.ChannelID == channelID))
				{
					return Conflict();
				}
				else { throw; }
			}
			return new ActionResult<bool>(true);
		}

		/// <summary>
		/// Remove a keyword from a channel's list of keywords
		/// </summary>
		/// <param name="keywordID"></param>
		/// <param name="channelID"></param>
		/// <returns></returns>
		[HttpDelete("removeKeyword/channel/{keywordID}/{channelID}")]
		public async Task<ActionResult<ChannelKeyword>> RemoveKeywordChannelAssociation(int keywordID, int channelID)
		{
			var rel = await _context.ChannelKeyword.FindAsync(keywordID, channelID);
			if (rel == null)
			{
				return NotFound();
			}

			_context.ChannelKeyword.Remove(rel);
			await _context.SaveChangesAsync();

			return rel;
		}
	}
}
