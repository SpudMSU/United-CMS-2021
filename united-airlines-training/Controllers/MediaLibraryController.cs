using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using united_airlines_training.Models;
using System.Data.SqlClient;
using System.Data;
using System.Text.RegularExpressions;
using System.IO.Compression;
using System.IO;
using Microsoft.AspNetCore.Http;
using System.Text;
using Microsoft.Extensions.Configuration;
using System.Net;
using CsvHelper;
using System.Globalization;

namespace united_airlines_training.Controllers 
{
	/// <summary>
	/// Author: Shawn Pryde
	/// -
	/// Interacts with the SQL Server database to get specific
	/// Media Items
	/// </summary>

	[Route("api/[controller]")]
	[ApiController]
	public class MediaLibraryController : Controller
	{
		// database connection context
		private readonly tomtcmsContext _context;
		private readonly string _folderPath;
		readonly SqlConnection con;
		private readonly NetworkConnection _nc;
		/// <summary>
		/// Constructor
		/// </summary>
		/// <param name="context">Azure Database context used to connect to SQL Server</param>
		public MediaLibraryController(tomtcmsContext context, IConfiguration configuration)
		{
			_context = context;
			con = StaticFunctions.GetConnection();
			_folderPath = @configuration.GetValue<string>("TestFolder");

            if (configuration.GetValue<bool>("build"))
            {
				NetworkCredential sourceCredentials = new NetworkCredential
				{
					Domain = configuration.GetValue<string>("FileServer:domain").ToString(),
					UserName = configuration.GetValue<string>("FileServer:username").ToString(),
					Password = configuration.GetValue<string>("FileServer:password").ToString(),
				};
				_nc = new NetworkConnection(configuration.GetValue<string>("FileServer:folderPath"), sourceCredentials);
				Console.WriteLine("File server connected.");
				_folderPath = configuration.GetValue<string>("FileServer:folderPath");
			}
		}

		/// <summary>
		/// Gets the list of all Media Items within the database
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public async Task<ActionResult<IEnumerable<MediaItem>>> GetAllMedia()
		{
			var res = await _context.Media.ToListAsync();

			return res;
		}


		/// <summary>
		/// Gets a specific Media Item from the database
		/// </summary>
		/// <param name="mediaID">ID of the item we want</param>
		/// <returns></returns>
		/// Note: Changes made to this function signature will need to be manually
		/// reflected in the PostMediaItem function
		[HttpGet("{mediaID}")]
		public async Task<ActionResult<MediaItem>> GetMediaItem(int mediaID)
		{
			var media = await _context.Media.FindAsync(mediaID);
			if (media == null)
			{
				return NoContent();
			}

			return media;
		}//*/

		/// <summary>
		/// Getter for the channels of a media item
		/// </summary>
		/// <param name="mediaID"></param>
		/// <returns></returns>
		[HttpGet("channels/{mediaID}")]
		public async Task<ActionResult<Channel[]>> GetChannelsOfMedia(int mediaID)
		{
			var rels = await _context.MediaToChannel.Where(rel => rel.MediaID == mediaID).ToArrayAsync();
			if (rels == null || rels.Length == 0)
            {
				return new Channel[0];
            }
			Channel[] result = new Channel[rels.Length];
			ChannelController cc = new ChannelController(_context);
			int i = 0;
			foreach(MediaToChannel mc in rels)
            {
				result[i] = (await cc.GetChannel(mc.ChannelID)).Value;
				i++;
            }
			return new ActionResult<Channel[]>(result);
		}

		/// <summary>
		/// Modify an existing MediaItem entry
		/// in our database
		/// </summary>
		/// <param name="id">id of the media being updated</param>
		/// <param name="media">The modified entry to update</param>
		/// <returns></returns>
		[HttpPut("{id}")]
		public async Task<IActionResult> PutMediaItem(int id, MediaItem media) //[FromBody]
		{
			if (id != media.MediaID)
			{
				return BadRequest();
			}

			_context.Entry(media).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!MediaItemExists(media.MediaID))
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

		[HttpPut("{mediaId}/commenting/{enabled}")]
		public async Task<IActionResult> AlterMediaItemCommentingEnabled(int mediaId, bool enabled)
      {
			var media = await _context.Media.FirstOrDefaultAsync(ele => ele.MediaID == mediaId);
			if (media == null)
         {
				return NotFound("Media item with ID: " + mediaId + " Not found");
         }

			media.CommentingEnabled = enabled;

			_context.Entry(media).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!MediaItemExists(media.MediaID))
				{
					return NotFound();
				}
				else
				{
					throw;
				}
			}

			return Ok();

		}

		/// <summary>
		/// Add the provided MediaItem instance to the database
		/// </summary>
		/// <param name="media"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<ActionResult<MediaItem>> PostMediaItem(MediaItem media) // [FromBody] 
		{
			_context.Media.Add(media);
			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateException)
			{
				if (MediaItemExists(media.MediaID)) // item with the same ID already exists
				{
					return Conflict();
				}
				else { throw; }
			}
			return CreatedAtAction("GetMediaItem", new { mediaId = media.MediaID }, media);
		}

		/// <summary>
		/// Removes a MediaItem entry from the database table
		/// </summary>
		/// <param name="mediaId">mediaid of the entry to remove</param>
		/// <returns></returns>
		[HttpDelete("{mediaID}")]
		public async Task<ActionResult<MediaItem>> DeleteMediaItem(int mediaId)
		{
			var mediaItem = await _context.Media.FindAsync(mediaId);
			if (mediaItem == null)
			{
				return NotFound();
			}

			_context.Media.Remove(mediaItem);
			await _context.SaveChangesAsync();

			return mediaItem;
		}

		/// <summary>
		/// Using a given search query, returns a list of media
		/// items with database attributes that match the query
		/// </summary>
		/// <param name="titleTokenString">the search string</param>
		/// <returns></returns>
		[HttpGet("search/{titleTokenString}/{retiredMedia}")]
		public async Task<ActionResult<IEnumerable<MediaItem>>> GetMediaFromSearch(string titleTokenString, bool retiredMedia=false)
		{
			// convert the token string into tokens using regex
			Regex rx = new Regex(@"([\w\/]+){1,}");
			MatchCollection matches = rx.Matches(titleTokenString);
			// create the query using those tokens
			Console.WriteLine(retiredMedia);
			string queryString = @"
				SELECT DISTINCT m.*
				FROM Media as m
				LEFT OUTER JOIN MediaKeyword AS mk
				ON mk.MediaID = m.MediaID
				LEFT OUTER JOIN Keyword AS k
				ON k.ID = mk.KeywordID
				WHERE ";
            #region Setup query to get any related media
			if (!retiredMedia)
            {
				queryString += @"m.MediaStatus = 'A' AND ";
			}
			queryString += "(";
			// query should check title, description, and keyword attributes
			foreach (Match match in matches.ToArray())
            {
				queryString += @"m.Title LIKE '%" + match.Value + 
					"%' OR m.Description LIKE '%" + match.Value + 
					"%' OR k.Word LIKE '%" + match.Value +
					"%' OR ";
            }
			queryString = queryString.Substring(0, queryString.Length - 4); //< remove the last OR
			queryString += ")";
			SqlCommand primaryQuery = new SqlCommand(queryString, con);
            #endregion

			// key == media
			// value == number of matches
            List<Tuple<MediaItem, int>> results = new List<Tuple<MediaItem, int>>();
			// attempt to run/read the query
			try
			{
				con.Open();
				primaryQuery.CommandType = CommandType.Text;
				SqlDataReader rdr = primaryQuery.ExecuteReader(); //< execute the query
				// read its results:
				var keywordControl = new KeywordController(_context);
				while (rdr.Read())
				{
					var med = MediaItem.SQLToMediaItem(rdr);
					var medKeywords = await keywordControl.GetKeywordsOfMedia(med.MediaID);
					// get a match count for the media
					int matchCount = 0;
					foreach (Match match in matches.ToArray()) 
					{
						// iterate over media column vals
						if (med.Title.ToLower().Contains(match.Value.ToLower()))
                        {
							matchCount++;
                        }
						if (med.Description.ToLower().Contains(match.Value.ToLower()))
                        {
							matchCount++;
                        }
						// iterate over keywords
						foreach(var kewrd in medKeywords.Value)
                        {
							if (kewrd.Word.Contains(match.Value)) 
							{
								matchCount++;
                            }
                        }
					}
					// add it to the list
					results.Add(new Tuple<MediaItem, int>(med, matchCount));
				}
				con.Close();
			}
			catch (SqlException ex)
			{
				StaticFunctions.DisplaySqlException(ex);
			}
			// sort results by match count
			var sortedResults = results.OrderBy(rez => -rez.Item2);
			List<MediaItem> sortedResultsAsMedia = new List<MediaItem>();
			foreach(var s in sortedResults)
            {
				sortedResultsAsMedia.Add(s.Item1);
            }
			return new ActionResult<IEnumerable<MediaItem>>(sortedResultsAsMedia);
		}//*/

		/// <summary>
		/// Using an ordered array of search queries, returns a list of mediaItems
		/// which match the queries by the desired column names array
		/// </summary>
		/// <param name="tokenStrings">the search string</param>
		/// <param name="columnNames"> should be set to one 
		/// of the column identifiers of the MediaItem table.
		/// Use special name "channel" to restrict results to a specific channel
		/// </param>
		/// <remarks>If you change the names of these parameters, change the matching api call
		/// in mediaItem.service.ts</remarks>
		/// <returns></returns>
		[HttpGet("searchMultiParam")]
		public ActionResult<IEnumerable<MediaItem>> GetMediaItemsFromColumnSearch([FromQuery] string[] tokenStrings, [FromQuery] string[] columnNames)
		{
			// convert the token string into tokens using regex
			Regex rx = new Regex(@"(\w+){1,}");
			// create the query using those tokens
			string queryString = @"
				SELECT DISTINCT m.*
				FROM Media as m
				LEFT OUTER JOIN MediaToChannel AS c
				ON c.MediaID = m.MediaID
                WHERE ";

			for (int i = 0; i < tokenStrings.Length; i++)
			{
				// channel edge case
				if (columnNames[i].ToLower() == "channel")
                {
					queryString += @"c.ChannelID LIKE '" + tokenStrings[i] + "' AND ";
					continue;
                }

				MatchCollection matches = rx.Matches(tokenStrings[i]);
				foreach (Match match in matches.ToArray())
				{
					queryString += @"m." + columnNames[i] + " LIKE '%" + match.Value + "%' AND ";
				}
			}
			queryString = queryString.Substring(0, queryString.Length - 5); //< remove the last AND
			SqlCommand query = new SqlCommand(queryString, con);
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
			return new ActionResult<IEnumerable<MediaItem>>(result);
		}//*/

		/// <summary>
		/// Returns true if there exists an entry in the database
		/// MediaItem table with the provided mediaid
		/// </summary>
		/// <param name="mediaID"></param>
		/// <returns></returns>
		public bool MediaItemExists(int mediaID)
		{
			return _context.Media.Any(e => e.MediaID == mediaID);
		}

		#region Distance Learning and Distance Learning Sessions

		/// <summary>
		/// Getter for the list of tech talk sessions associated with a 
		/// specified tech talk media item
		/// </summary>
		/// <param name="mediaID"></param>
		/// <returns></returns>
		[HttpGet("distanceLearningSessions/{mediaID}")]
		public async Task<ActionResult<IEnumerable<DistanceLearningSession>>> GetSessionsOfTechTalk(int mediaID)
		{
			// make sure the item exists
			var medPromise = await GetMediaItem(mediaID);
			MediaItem item = medPromise.Value;
			if (item == null)
			{
				return NotFound();
			}
			var mTypeController = new MediaTypesController(_context);
			var mTypePromise = await mTypeController.GetMediaType(item.MediaTypeID);
			MediaType mType = mTypePromise.Value;
			// make sure it's a tech talk
			string typeName = mType.Name.ToLower();
			if (!(typeName.Contains("tech") && typeName.Contains("talk")))
			{
				return new ActionResult<IEnumerable<DistanceLearningSession>>(new List<DistanceLearningSession>());
			}
			return await _context.DistanceLearningSession.Where(m => m.MediaID == mediaID).ToListAsync();
		}

		[HttpGet("distanceLearning/{mediaId}")]
		public async Task<ActionResult<DistanceLearningMedia>> GetDistanceLearningMediaAttributes(int mediaId)
      {
			var mediaItem = await _context.Media.FirstOrDefaultAsync(ele => ele.MediaID == mediaId);
			if (mediaItem == null)
         {
				return NotFound("No media item with ID: '" + mediaId + "' exists" );
         }

			var distanceMedia = await _context.DistanceLearningMedia.FirstOrDefaultAsync(ele => ele.MediaId == mediaId);
			if (distanceMedia == null)
         {
				return NotFound("Distance Learning Media with ID: '" + mediaId + "' not found");
         }

         distanceMedia.Sessions = await _context.DistanceLearningSession.Where(ele => ele.MediaID == mediaId).ToListAsync();
         distanceMedia.AttendanceRequirements = await _context.DistanceLearningAttendanceRequirement.Where(ele => ele.MediaId == mediaId).ToListAsync();

			return Ok(distanceMedia);
      }

		[HttpPost("distanceLearning")]
		public async Task<ActionResult> AddNewDistanceLearningMedia(DistanceLearningMedia media)
      {
			if (await _context.DistanceLearningMedia.FindAsync(media.MediaId) != null)
         {
				return Conflict("Distance Learning Media with ID: '" + media.MediaId + "' already exists");
         }
			await _context.DistanceLearningMedia.AddAsync(media);

			if (media.AttendanceRequirements != null && media.AttendanceRequirements.Count != 0)
         {
				await _context.DistanceLearningAttendanceRequirement.AddRangeAsync(media.AttendanceRequirements);
         }

			if (media.Sessions != null && media.Sessions.Count != 0)
         {
				await _context.DistanceLearningSession.AddRangeAsync(media.Sessions);
         }

			try
         {
				await _context.SaveChangesAsync();
         }
			catch (DbUpdateException)
         {
				return Conflict();
         }

			return NoContent();

      }

      [HttpPut("distanceLearning")]
      public async Task<ActionResult> UpdateDistanceLearningMedia(DistanceLearningMedia updatedMedia)
      {
         var media = await _context.DistanceLearningMedia.FirstOrDefaultAsync(ele => ele.MediaId == updatedMedia.MediaId);
         if (media == null)
         {
            return NotFound("Distance Media item w/ ID: '" + updatedMedia.MediaId + "' does not exist");
         }

			media.Instructions = updatedMedia.Instructions;
			
			// Handle changes to sessions

			// Sessions that existed on this media item before the update
         var priorSessions = await _context.DistanceLearningSession.Where(ele => ele.MediaID == updatedMedia.MediaId).ToListAsync();

			// Delete sessions that are no longer there
			foreach(var priorSession in priorSessions)
         {
				var removed = updatedMedia.Sessions.Find(ele => ele.ID == priorSession.ID) == null;
				if (removed)
            {
					_context.DistanceLearningSession.Remove(priorSession);
            }
         }

			// Create sessions that are have been newly added
			foreach(var newSession in updatedMedia.Sessions)
         {
				var added = priorSessions.Find(ele => ele.ID == newSession.ID) == null;
				if (added)
            {
					_context.DistanceLearningSession.Add(newSession);
            }
         }

			// Handle changes to attendance requirements
         var priorRequirements = await _context.DistanceLearningAttendanceRequirement.Where(ele => ele.MediaId == updatedMedia.MediaId).ToListAsync();

			foreach(var newRequirement in updatedMedia.AttendanceRequirements)
         {
				var added = priorRequirements.Find(ele => ele.Id == newRequirement.Id) == null;
				if (added)
            {
					_context.DistanceLearningAttendanceRequirement.Add(newRequirement);
            }
         }

			foreach(var priorRequirement in priorRequirements)
         {
				var removed = updatedMedia.AttendanceRequirements.Find(ele => ele.Id == priorRequirement.Id) == null;
				if (removed)
            {
					_context.DistanceLearningAttendanceRequirement.Remove(priorRequirement);
            }
         }

			await _context.SaveChangesAsync();

			return Ok();
      }

      /// <summary>
      /// Add a new tech talk session to the database
      /// </summary>
      /// <param name="session"></param>
      /// <returns>The tech talk session as it appears in the database</returns>
      [HttpPost("distanceLearningSession")]
		public async Task<ActionResult<DistanceLearningSession>> CreateTechTalkSession(DistanceLearningSession session) // [FromBody] 
		{
			_context.DistanceLearningSession.Add(session);
			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateException)
			{
				if (DistanceLearningSessionExists(session.ID)) // item with the same ID already exists
				{
					return Conflict();
				}
				else { throw; }
			}
			return CreatedAtAction("GetTechTalkSession", new { ttID = session.ID }, session);
		}

		/// <summary>
		/// Gets a specific tech talk session from the database
		/// </summary>
		/// <param name="ttID">ID of the item we want</param>
		/// <returns></returns>
		/// Note: Changes made to this function signature will need to be manually
		/// reflected in the CreateTechTalkSession function
		public async Task<ActionResult<DistanceLearningSession>> GetDistanceLearningSession(int ttID)
		{
			var session = await _context.DistanceLearningSession.FindAsync(ttID);
			if (session == null)
			{
				return NotFound();
			}

			return session;
		}//*/

		/// <summary>
		/// Modify an existing TechTalkSession entry
		/// in our database
		/// </summary>
		/// <param name="id">id of the session being updated</param>
		/// <param name="session">The modified entry to update</param>
		/// <returns></returns>
		[HttpPut("distanceLearningSession/{id}")]
		public async Task<IActionResult> UpdateTechTalkSession(int id, DistanceLearningSession session) //[FromBody]
		{
			if (id != session.ID)
			{
				return BadRequest();
			}

			var existingSession = await _context.DistanceLearningSession.FirstOrDefaultAsync(ele => ele.ID == session.ID);

			// session does not exist in the system yet.  That's ok, we can just create a new one
			if (existingSession == null)
         {
				_context.DistanceLearningSession.Add(session);
         }
			else
         {
				existingSession.StartTime = session.StartTime;
				existingSession.EndTime = session.EndTime;
				existingSession.IsPasswordProtected = session.IsPasswordProtected;
				existingSession.Password = session.Password;
				existingSession.UrlPath = session.UrlPath;

				_context.Entry(existingSession).State = EntityState.Modified;
			}


			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!DistanceLearningSessionExists(session.ID))
				{
					return NotFound();
				}
				else
				{
					throw;
				}
			}

			if (existingSession == null)
         {
				existingSession = session;
         }

			return Ok(existingSession);
		}

		/// <summary>
		/// Returns true if there exists an entry in the database
		/// TechTalkSession table with the provided id
		/// </summary>
		/// <param name="sessionID"></param>
		/// <returns></returns>
		private bool DistanceLearningSessionExists(int sessionID)
		{
			return _context.DistanceLearningSession.Any(e => e.ID == sessionID);
		}

		/// <summary>
		/// Removes a TechTalkSession entry from the database table
		/// </summary>
		/// <param name="sessionId">sessionid of the entry to remove</param>
		/// <returns></returns>
		[HttpDelete("distanceLearningSession/{sessionID}")]
		public async Task<ActionResult<DistanceLearningSession>> DeleteTechTalkSession(int sessionId)
		{
			var sessionItem = await _context.DistanceLearningSession.FindAsync(sessionId);
			if (sessionItem == null)
			{
				return NotFound();
			}

			_context.DistanceLearningSession.Remove(sessionItem);
			await _context.SaveChangesAsync();

			return sessionItem;
		}

        #endregion

        #region Data-Import-Export
        [HttpPost("Export/MediaFiles")]
		public FileResult ExportData([FromForm] string path)
		{
			path = FolderAddressFilter(path);
			System.Guid guid = new Guid();
			guid = Guid.NewGuid();
			string zipName = guid.ToString();
			
			zipName = Path.GetTempPath() + zipName + ".zip";
			ZipFile.CreateFromDirectory(path, zipName);
			var stream = System.IO.File.OpenRead(zipName);
			return File(stream, "application/zip", "Export.zip");
		}


		[HttpPost("Import/MediaFiles")]
		[RequestSizeLimit(100_000_000)]
		public async Task<IActionResult> ImportData([FromForm] IFormCollection formData, [FromForm] string path)
		{
			path = FolderAddressFilter(path);

			IFormFileCollection files = formData.Files;

			long size = files.Sum(f => f.Length);

			if (!Directory.Exists(path))
				Directory.CreateDirectory(path);

			foreach (var formFile in files)
			{
				var inputName = formFile.Name;
				var filePath = path + formFile.FileName.Substring(formFile.FileName.LastIndexOf("\\") + 1);

				if (formFile.Length > 0)
				{
					using (var stream = new FileStream(filePath, FileMode.Create))
					{
						await formFile.CopyToAsync(stream);
					}
				}
			}

			return Ok(new { count = files.Count, size });
		}

		[HttpPost("Export/MediaData/CSV")]
		public FileResult ExportCSV()
        {
			System.Guid guid = new Guid();
			guid = Guid.NewGuid();
			string csvName = Path.GetTempPath() + guid.ToString() + ".csv";
			//string csvName = Path.GetTempPath() + guid.ToString() + ".csv";

			var allMedia = GetAllMedia().Result.Value;
			using (var writer = new StreamWriter(csvName))
			using (var csvwriter = new CsvWriter(writer, CultureInfo.InvariantCulture))
			{
				csvwriter.WriteRecords(allMedia);
				writer.Close();
			}
			Console.WriteLine("csv file created.");
			var csv = System.IO.File.OpenRead(csvName);

			return File(csv,"application/csv", "Data.csv");
        }

		[HttpPost("Import/MediaData/CSV")]
		public async Task<IActionResult> ImportCSV([FromForm] IFormCollection formData)
        {
			var file = formData.Files[0];
			System.Guid guid = new Guid();
			guid = Guid.NewGuid();
			var filePath = Path.GetTempPath() + guid.ToString() + ".csv";
			if (file.Length > 0)
			{
				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					await file.CopyToAsync(stream);
				}
			}
			var datas = GetData(filePath);
			foreach( var media in datas)
            {
				media.MediaID = 0;
				await PostMediaItem(media);
			}
			return Ok();
		}

		private MediaItem[] GetData(string filepath)
        {
			using (var reader = new StreamReader(filepath))
			using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
			{
				var records = csv.GetRecords<MediaItem>();
				var medias = records.ToArray();
				return medias;
			}
		}


		private string FolderAddressFilter(string path)
        {
			if (path[path.Length - 1] != '\\')
				path += "\\";
			if (path[0] != '\\')
				path = "\\" + path;

			Regex r1 = new Regex("/+");
			Regex r2 = new Regex("\\\\+");

			path = r2.Replace(path, "/");
			path = r1.Replace(path, "/");
			string folder = _folderPath;
			if (_folderPath[_folderPath.Length - 1] == '/' || _folderPath[_folderPath.Length - 1] == '\\')
				folder = folder.Substring(0, _folderPath.Length - 1);
			path = folder + path;
			return path;
		}
		#endregion
	}
}
