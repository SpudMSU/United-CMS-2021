using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using united_airlines_training.Analytics;
using united_airlines_training.Models;
using united_airlines_training.Models.Report;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Analytics controller to support API request and response from front end to retrieve back-end analytics.
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticController : Controller
    {
        AnalyticsGenerator ag = new AnalyticsGenerator();
        private readonly tomtcmsContext _context;
        private readonly IConfiguration _config;
        readonly SqlConnection con;
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public AnalyticController(tomtcmsContext context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
            con = StaticFunctions.GetConnection();
        }

        /// <summary>
        /// GET: api/Analytic/Test
        /// Primarily used for testing some generator functions
        /// </summary>
        /// <returns></returns>
        [HttpGet("Test")]
        public IActionResult Index()
        {
            return Ok("Nothing");
        }

        /// <summary>
        /// Converts a media ID list to a media model list
        /// </summary>
        /// <returns>List of media objects</returns>
        public List<MediaItem> addMediaList(List<int> mediaIDList)
        {
            List<MediaItem> listMedia = new List<MediaItem>();
            var mediaController = new MediaLibraryController(_context, _config);
            foreach (var id in mediaIDList)
            {
                var result = mediaController.GetMediaItem(id);
                if (!(result.Result.Result is NotFoundResult))
                {
                    listMedia.Add(result.Result.Value);
                }
            }
            return listMedia;
        }

        /// <summary>
        /// GET: api/Analytic/Latest
        /// Get latest media uploaded to site (analytics generator has it within the last month)
        /// </summary>
        /// <returns>Object result with the top 10 latest media items</returns>
        [HttpGet("Latest")]
        public IActionResult GetLatestMedia()
        {
            List<int> latestMediaID = ag.getLatestMedia();
            List<MediaItem> latestMedia = addMediaList(latestMediaID);

            return Ok(latestMedia);
        }


        /// <summary>
        /// GET: api/Analytic/Trending
        /// Get trending media based on click through rate of all users
        /// </summary>
        /// <returns>Object result with top 10 trending media items</returns>
        [HttpGet("Trending")]
        public IActionResult GetTrendingMedia()
        {
            List<int> trendingMediaID = ag.getTrendingMedia();
            List<MediaItem> trendingMedia = addMediaList(trendingMediaID);

            return Ok(trendingMedia);
        }

        /// <summary>
        /// GET: api/Analytic/WatchDuration/1
        /// Get average watch duration for a particular media item
        /// </summary>
        /// <returns>Object result with media item average watch duration</returns>
        [HttpGet("WatchDuration/{mediaID}")]
        public IActionResult GetMediaAverageWatchDuration(int mediaID)
        {
            float? watchDuration = ag.generateMediaAnalysisUserEngagement(mediaID);

            return Ok(new { watchDuration });
        }

        /// <summary>
        /// GET: api/Analytic/OpenOrPlayed/1
        /// Get all open or played media for a user
        /// </summary>
        /// <returns>Object result with open or played media</returns>
        [HttpGet("OpenOrPlayed/{uid}")]
        public IActionResult GetOpenOrPlayedMedia(string uid)
        {
            List<MediaItem> openOrPlayedMedia = ag.generateUserOpenOrPlayItems(uid);

            return Ok(openOrPlayedMedia);
        }

        /// <summary>
        /// GET: api/Analytic/Utilization/1
        /// Get utilization rate for a particular media item
        /// </summary>
        /// <returns>Object result with media item utilization rate</returns>
        [HttpGet("Utilization/{mediaID}")]
        public IActionResult GetMediaUtilization(int mediaID)
        {
            float utilization = ag.generateUtilization(mediaID);

            return Ok(new { utilization });
        }

        /// <summary>
        /// GET: api/Analytic/Hot
        /// Get top 10 hot media items that are flagged as hot (cap for the sake of overflowing the home page)
        /// </summary>
        /// <returns>Object result with top 10 media items flagged as hot</returns>
        [HttpGet("Hot")]
        public IActionResult GetHotMedia()
        {
            User currentUser = (User)HttpContext.Items["user"];
            List<int> hotMediaID = ag.getHotMedia(currentUser);
            List<MediaItem> hotMedia = addMediaList(hotMediaID);

            return Ok(hotMedia);
        }

        /// <summary>
        /// GET: api/Analytic/Recommended
        /// Get recommended media. This is based on similar user attributes factoring in location code, department, cost center code
        /// </summary>
        /// <returns>Object result with top 10 media items recommended</returns>
        [HttpGet("Recommended/{uid}")]
        public IActionResult GetRecommendedMedia(string uid)
        {
            UserController uc = new UserController(_context);
            User currentUser = uc.GetUser(uid).Result.Value;
            List<int> recommendedMediaID = ag.getRecommendedMedia(currentUser);
            List<MediaItem> recommendedMedia = addMediaList(recommendedMediaID);

            return Ok(recommendedMedia);
        }

        /// <summary>
        /// Given a media item, returns the list of media 
        /// from the database ranked by similarity to the 
        /// given media item
        /// </summary>
        /// <param name="originalMediaID"></param>
        /// <returns></returns>
        [HttpGet("Related/{originalMediaID}")]
        public async Task<ActionResult<IEnumerable<MediaItem>>> GetRelatedMedia(int originalMediaID)
        {
            // initial set up
            KeywordController kwControl = new KeywordController(_context);
            MediaLibraryController mlControl = new MediaLibraryController(_context, _config);
            Keyword[] allKeywords = (await kwControl.GetAllKeywords()).Value.ToArray();
            // get the base media's keyword relation array
            Keyword[] baseKeywords = (await kwControl.GetKeywordsOfMedia(originalMediaID)).Value.ToArray();
            if (baseKeywords.Length == 0)
            {
                // calling media has no keywords and therefore no similarities
                return NotFound();
            }
            int[] baseComparison = GetSimilarityVector(baseKeywords);
            float bottomLeftOperand = MathF.Sqrt(GetSumOfSquares(baseComparison));
            // iterate over every other media item, determining their similarity score
            // key = similarity score
            // value = item
            List<KeyValuePair<float, MediaItem>> otherItemSimilarities = new List<KeyValuePair<float, MediaItem>>();
            MediaItem[] allMedia = (await mlControl.GetAllMedia()).Value.ToArray();
            foreach (MediaItem item in allMedia)
            {
                if (item.MediaID == originalMediaID || item.MediaStatus != "A") { continue; } //< skip the calling media item
                Keyword[] itemKeywords = (await kwControl.GetKeywordsOfMedia(item.MediaID)).Value.ToArray();
                if (itemKeywords.Length < 1) { continue; } //< skip items which have no keywords
                int[] itemComparison = GetSimilarityVector(itemKeywords);
                if (itemComparison.Length != baseComparison.Length) { continue; } //< this should never happen
                // compute cosine similarity score
                float bottomRightOperand = MathF.Sqrt(GetSumOfSquares(itemComparison));
                float numerator = 0f;
                for (int index = 0; index < itemComparison.Length; index++)
                {
                    numerator += itemComparison[index] * baseComparison[index];
                }
                float cosineSimilarityValue = numerator / (bottomLeftOperand * bottomRightOperand);
                // add it to the list
                otherItemSimilarities.Add(new KeyValuePair<float, MediaItem>(cosineSimilarityValue, item));
            }
            // sort by similiarity value
            otherItemSimilarities.Sort((kp1, kp2) => kp2.Key.CompareTo(kp1.Key));
            // convert to ordered mediaitem array
            MediaItem[] orderedMedia = new MediaItem[otherItemSimilarities.Count];
            for (int x = 0; x < otherItemSimilarities.Count; x++)
            {
                orderedMedia[x] = otherItemSimilarities[x].Value;
            }
            return new ActionResult<IEnumerable<MediaItem>>(orderedMedia);
            #region Functionally scoped methods
            // get the keyword vector for a given array of keywords
            // based on the array of all keywords
            int[] GetSimilarityVector(Keyword[] myKeywords)
            {
                int[] mySimVector = new int[allKeywords.Length];
                int i = 0;
                foreach (Keyword k in allKeywords)
                {
                    mySimVector[i] = 0;
                    // have to do this because array.contains(k) wasn't working
                    foreach (Keyword innerK in myKeywords) 
                    {
                        if (innerK.ID == k.ID)
                        {
                            mySimVector[i] = 1;
                        }
                    }
                    i++;
                }
                return mySimVector;
            }
            float GetSumOfSquares(int[] compValues)
            {
                float sumOfSquares = 0f;
                foreach (int val in compValues)
                {
                    sumOfSquares += (val * val);
                }
                return sumOfSquares;
            }
            #endregion
        }
        [EnableCors("Report Get")]
        [HttpPost("Media")]
        public IActionResult GenerateMediaAnalytic([FromForm] int MediaId, [FromForm] string dep, [FromForm] string cost, [FromForm] string loc)
        {
            Console.WriteLine(HttpContext.Request.Host.Value == ("localhost:5000"));
            if (MediaId == 0)
            {
                return StatusCode(500);
            }
            MediaReport res = new MediaReport();

            string getMediaString = @"SELECT * FROM Media WHERE Media.MediaID = " + MediaId + ";";
            SqlCommand getMediaQuery = new SqlCommand(getMediaString, con);
            try
            {
                con.Open();
                getMediaQuery.CommandType = System.Data.CommandType.Text;
                SqlDataReader rdr = getMediaQuery.ExecuteReader();
                bool isMediaExist = false;
                while(rdr.Read())
                {
                    isMediaExist = true;
                    res.media = MediaItem.SQLToMediaItem(rdr);
                }
                if(!isMediaExist)
                {
                    return StatusCode(200);
                }
                rdr.Close();
                con.Close();
            }
            catch (Exception e)
            {
                return StatusCode(200);
            }

            string hisQueryString = @"SELECT
	                [User].UID,
	                [User].FirstName,
	                [User].LastName,
	                [User].Email,
	                [User].JobRoleCode,
	                [User].Department,
	                [User].LocationCode,
	                UserHistory.ClickedAmount,
	                UserHistory.UpdatedAt,
	                UserHistory.WatchLength,
	                Rating.[Like] 
                FROM
	                [UserHistory]
	                INNER JOIN [User] ON [User].UID = UserHistory.UID
	                LEFT JOIN Rating ON Rating.UID = UserHistory.UID AND Rating.MediaID = UserHistory.MediaID
                WHERE
	                UserHistory.MediaID =";

            hisQueryString += MediaId;

            if(dep!=null)
            {
                hisQueryString += " AND Department = '" + dep + "'";
            }
            if(cost!= null)
            {
                hisQueryString += " AND CostCenter = '" + cost + "'";
            }
            if (loc!=null)
            {
                hisQueryString += " AND LocationCode = '" + loc + "'";
            }
            hisQueryString += ";";


            SqlCommand hisQuery = new SqlCommand(hisQueryString, con);

            try
            {
                con.Open();
                hisQuery.CommandType = System.Data.CommandType.Text;
                SqlDataReader rdr = hisQuery.ExecuteReader();
                int count = 0;
                res.ratings = new List<RateRecord>();
                while (rdr.Read())
                {
                    RateRecord rr = RateRecord.SqltoRateRecord(rdr);
                    if (rr.Like == null)
                        ;
                    else if (rr.Like == true)
                        res.likes += 1;
                    else
                        res.dislikes += 1;
                    res.ratings.Add(rr);
                    res.watchDuration += Convert.ToDouble(rdr["WatchLength"].ToString()) * 100;
                    count += 1;
                }
                if(res.dislikes + res.likes != 0)
                {
                    res.ldRatio = (double)res.likes / (res.likes + res.dislikes);
                }
                Dictionary<string, string> filter = new Dictionary<string, string>();
                filter.Add("Location", loc);
                filter.Add("CostCenter", cost);
                filter.Add("Department", dep);
                res.Utilization = ag.generateUtilization(MediaId, filter);
                res.watchDuration /= (count * 100);
            }
            catch(Exception e)
            {
                return StatusCode(200);
            }

            return Ok(res);
        }
        [HttpPost("Group")]
        public IActionResult GenerateGroupAnalytic([FromForm] string dep, [FromForm] string cost, [FromForm] string loc)
        {
            GroupReport res = new GroupReport();
            string hisQueryString = @"SELECT
	                [User].UID,
	                [User].FirstName,
	                [User].LastName,
	                [User].JobRoleCode,
	                [User].Department,
	                [User].LocationCode,
					[User].CostCenterDesc,
                    [User].CostCenter,
					Rating.[Like],
	                UserHistory.ClickedAmount,
	                UserHistory.UpdatedAt,
				    Media.MediaID,
					Media.Title,
					Media.MediaTypeID
                FROM
	                [UserHistory]
	                INNER JOIN [User] ON [User].UID = UserHistory.UID
					INNER JOIN Media ON Media.MediaID = UserHistory.MediaID
	                LEFT JOIN Rating ON
                        Rating.UID = UserHistory.UID AND
                        Rating.MediaID = UserHistory.MediaID";
            bool is_changed = false;
            string whereQuery = "";
            
            if (dep != null)
            {
                whereQuery += "Department = '" + dep + "'";
                is_changed = true;
            }
            if (cost != null)
            {
                if (is_changed)
                    whereQuery += " AND ";
                is_changed = true;
                whereQuery += "CostCenter = '" + cost + "'";
            }
            if (loc != null)
            {
                if (is_changed)
                    whereQuery += " AND ";
                is_changed = true;
                whereQuery += "LocationCode = '" + loc + "'";
            }
            if (is_changed)
                whereQuery = " WHERE " + whereQuery;
            hisQueryString += whereQuery +";";


            SqlCommand hisQuery = new SqlCommand(hisQueryString, con);

            try
            {
                con.Open();
                hisQuery.CommandType = System.Data.CommandType.Text;
                SqlDataReader rdr = hisQuery.ExecuteReader();
                res.info = new List<GroupInfo>();
                while (rdr.Read())
                {
                    GroupInfo gi = GroupInfo.SqltoRateRecord(rdr);
                    res.info.Add(gi);
                }
            }
            catch (Exception e)
            {
                return StatusCode(200);
            }

            return Ok(res);
        }
    }
}
