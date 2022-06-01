using System;
using System.Collections.Generic;
using united_airlines_training.Models;
using System.Data.SqlClient;
using System.Data;

namespace united_airlines_training.Analytics
{
	public class WatchDuration
	{
		private string _UID;
		private MediaItem _watched;
		private float _duration;
		public WatchDuration(string UID, MediaItem watched, float duration)
		{
			_UID = UID;
			_watched = watched;
			_duration = duration;
		}
	}

	/// <summary>
	/// Author: Chris Nosowsky
	/// <br></br>
	/// Analytics algorithms that are optimized to filter media content by user shared attributes.
	/// <br></br>
	/// Allows to display media recommendations, hot media items, trending media items, and newly created media items.
	/// </summary>

	public class AnalyticsGenerator
	{
		public List<int> trending = new List<int>();
		public List<int> hot = new List<int>();
		public List<int> newMedia = new List<int>();
		public List<int> recommended = new List<int>();

		public List<User> usersHotVideos = new List<User>();
		public List<MediaItem> userWatchedMedias = new List<MediaItem>();
		public List<User> mediaOpenedOrPlayedUsers = new List<User>();
		public float? avgMediaViewDurationPercentage = 0;

		public Dictionary<User, WatchDuration> storedUserVideoDuration = new Dictionary<User, WatchDuration>();
		readonly SqlConnection con;

		/// <summary>
		/// Constructor initializes configuration and establishes a SQL connection with database
		/// </summary>
		public AnalyticsGenerator()
		{
			con = StaticFunctions.GetConnection();
		}

		/// <summary>
		/// Stores into a dictionary that user watched a video and for the duration amount
		/// </summary>
		public void StoreVideoWatched(User user, MediaItem watched, float duration)
		{
			WatchDuration watchDuration = new WatchDuration(user.UID, watched, duration);
			storedUserVideoDuration.Add(user, watchDuration);
		}

		/// <summary>
		/// A general SQL command runner function that takes in the SQL query, 
		/// whether or not it requires a user object for user attributes, and the occasion it is for (ex. trending, recommended, etc.)m
		/// </summary>
		public List<int> genericCommandExecute(SqlCommand command, User user=null, string occasion="")
		{
			List<int> result = new List<int>();
			try
			{
				con.Open();
				SqlCommand queryResult = command;

				queryResult.CommandType = CommandType.Text;
				if (user != null)
				{
					var locationCode = user.LocationCode;
					var jobRoleCode = user.JobRoleCode;
					var department = user.Department;
					var jobGroup = user.JobGroup;
					var costCenter = user.CostCenter;
					queryResult.Parameters.AddWithValue("@locationCode", ((object)locationCode) ?? DBNull.Value);
					queryResult.Parameters.AddWithValue("@jobRoleCode", ((object)jobRoleCode) ?? DBNull.Value);
					queryResult.Parameters.AddWithValue("@department", ((object)department) ?? DBNull.Value);
					queryResult.Parameters.AddWithValue("@jobGroup", ((object)jobGroup) ?? DBNull.Value);
					queryResult.Parameters.AddWithValue("@costCenter", ((object)costCenter) ?? DBNull.Value);
				}
				SqlDataReader rdr = queryResult.ExecuteReader();
				while (rdr.Read())
				{
					int MediaID = int.Parse(rdr["MediaID"].ToString());
					Console.WriteLine("Media Item " + MediaID + " is " + occasion);
					result.Add(MediaID);
				}
				con.Close();
			}
			catch (SqlException ex)
			{
				for (int i = 0; i < ex.Errors.Count; i++)
				{
					Console.WriteLine($"Index # {i} Error: {ex.Errors[i].ToString()}");
				}
			}
			return result;

		}

		/// <summary>
		/// Get the top 10 recommended media based on 
		/// 1. job role code 
		/// 2. department 
		/// 3. cost center 
		/// 4. job group 
		/// 5. location code
		/// Also checks that the media status is active
		/// </summary>
		public List<int> getRecommendedMedia(User user) {
			SqlCommand recommendedResult = new SqlCommand(@"
				SELECT TOP 10 uh.MediaID, SUM(uh.WatchLength) as TotalWatchTime, 
				SUM(uh.ClickedAmount) as TotalClicks, 
				COUNT([Like]) as Likes
				FROM UserHistory AS uh
				LEFT OUTER JOIN Rating AS r
				ON r.UID = uh.UID
				AND r.MediaID = uh.MediaID
				LEFT OUTER JOIN [User] AS u
				on u.UID = uh.UID
				LEFT OUTER JOIN Media AS m
				on m.MediaID = uh.MediaID
				WHERE
				(u.LocationCode = @locationCode
				OR u.JobRoleCode = @jobRoleCode
				OR u.Department = @department
				OR u.JobGroup = @jobGroup
				OR u.CostCenter = @costCenter)
				AND m.MediaStatus = 'A'
				GROUP BY uh.MediaID
				ORDER BY TotalClicks DESC, Likes DESC, TotalWatchTime DESC
			", con); ;
			recommended = genericCommandExecute(recommendedResult, user, "recommended");
			return recommended;

		}

		/// <summary>
		/// Get trending items based on 1. Like rating amount and 2. Number of completed views
		/// </summary>
		public List<int> getTrendingMedia()
		{
			SqlCommand selectTrendingMedia = new SqlCommand(@"
					SELECT DISTINCT TOP 10 r.MediaID, r.Likes, COUNT(CASE WHEN CompleteView = 1 THEN 1 END) AS CompleteViewCount
					FROM (
					SELECT MediaID, COUNT([Like]) as Likes
					FROM Rating
					WHERE [Like] = 1
					GROUP BY MediaID) AS r
					LEFT OUTER JOIN UserHistory AS uh
					ON uh.MediaID = r.MediaID
					LEFT OUTER JOIN Media as m
					ON m.MediaID = r.MediaID
					WHERE m.MediaStatus = 'A'
					GROUP BY r.MediaID, r.Likes
					ORDER BY Likes DESC, CompleteViewCount DESC
			", con);
			trending = genericCommandExecute(selectTrendingMedia, occasion: "trending");
			return trending;
		}

		/// <summary>
		/// Get hot items flagged by admin
		/// </summary>
		public List<int> getHotMedia(User user)
		{
			SqlCommand selectFlaggedMedia = new SqlCommand(@"
				SELECT TOP 10 * FROM Media 
				WHERE
				MediaStatus = 'A' AND
				FlaggedAllUsers = 1 OR
					(
						FlaggedAllUsers = 0
						AND
						(
							FlaggedLocations IS NULL
							OR FlaggedLocations LIKE '%@locationCode%'
						)
						AND
						(
							FlaggedJobCodes is NULL
							OR FlaggedJobCodes LIKE '%@jobRoleCode%'
						)
						AND 
						(
							FlaggedDepartments is NULL
							OR FlaggedDepartments LIKE '%@department%'
						)
						AND 
						(
							FlaggedJobGroups is NULL
							OR FlaggedJobGroups LIKE '%@jobGroup%'
						)
						AND 
						(
							FlaggedCostCenters is NULL
							OR FlaggedCostCenters LIKE '%@costCenter%'
						)
					)
				ORDER BY CreatedAt DESC", con);
			hot = genericCommandExecute(selectFlaggedMedia, user, "hot");
			return hot;
		}

		public List<int> getLatestMedia()
		{
			SqlCommand selectLatestMedia = new SqlCommand(@"SELECT TOP 10 MediaID, DATEDIFF(DAY, CreatedAt, GetDate()) 
															AS DaysLastChanged FROM Media 
															WHERE DATEDIFF(DAY, CreatedAt, GetDate()) <= 30
															AND MediaStatus = 'A'
															ORDER BY DaysLastChanged", con);
			newMedia = genericCommandExecute(selectLatestMedia, occasion: "latest");
			return newMedia;
		}

		/// <summary>
		/// Get all media items utilization
		/// </summary>
		public float generateUtilization(int mediaID, Dictionary<string, string> filter = null)
		{
			// divide mediaitem view/click count by total view/click count of all mediaitems
			float utilizationCalculation = 0;
			try
			{
				con.Open();
				string sqlString = @"SELECT SUM(uh.ClickedAmount) AS FullClickTotal 
														FROM Media AS m 
														LEFT OUTER JOIN UserHistory AS uh 
														ON m.MediaID = uh.MediaID
														LEFT OUTER JOIN [User] as u
														ON u.[UID] = uh.[UID]
														WHERE m.MediaStatus = 'A'
														AND u.EmploymentStatus = 'A'";
				if(filter != null)
                {
					if(filter.ContainsKey("Department"))
						sqlString += " AND u.Department = " + filter["Department"];
					if (filter.ContainsKey("Location"))
						sqlString += "AND u.LocationCode = " + filter["Location"];
					if (filter.ContainsKey("CostCenter"))
						sqlString += "AND u.CostCenter = " + filter["CostCenter"];

				}
				SqlCommand totalClicks = new SqlCommand(sqlString, con);
				totalClicks.CommandType = CommandType.Text;
				SqlDataReader rdr = totalClicks.ExecuteReader();
				rdr.Read();
				int fullClickAmountAllMedia = int.Parse(rdr["FullClickTotal"].ToString());
				rdr.Close();
				sqlString = @"SELECT m.MediaID, SUM(uh.ClickedAmount) AS ClickTotal 
																FROM Media AS m 
																LEFT OUTER JOIN UserHistory AS uh
																ON m.MediaID = uh.MediaID
																LEFT OUTER JOIN [User] as u
																ON u.[UID] = uh.[UID]
																WHERE m.MediaID = @mediaID
																AND u.EmploymentStatus = 'A'
																GROUP BY m.MediaID";
				if (filter != null)
				{
					if (filter.ContainsKey("Department"))
						sqlString += " AND u.Department = " + filter["Department"];
					if (filter.ContainsKey("Location"))
						sqlString += "AND u.LocationCode = " + filter["Location"];
					if (filter.ContainsKey("CostCenter"))
						sqlString += "AND u.CostCenter = " + filter["CostCenter"];

				}
				SqlCommand mediaClickAmount = new SqlCommand(sqlString, con);

				mediaClickAmount.CommandType = CommandType.Text;
				var mediaIDNum = mediaID;
				mediaClickAmount.Parameters.AddWithValue("@mediaID", ((object)mediaIDNum) ?? DBNull.Value);

				rdr = mediaClickAmount.ExecuteReader();

				int clickTotal = 0;
				if(rdr.Read())
                {
					if (rdr["ClickTotal"].ToString() != "")
						clickTotal = int.Parse(rdr["ClickTotal"].ToString());
				}


                utilizationCalculation = ((float)clickTotal) / fullClickAmountAllMedia;
				con.Close();
			}
			catch (SqlException ex)
			{
				for (int i = 0; i < ex.Errors.Count; i++)
				{
					Console.WriteLine($"Index # {i} Error: {ex.Errors[i].ToString()}");
				}
			}
			return utilizationCalculation;
		}

		/// <summary>
		/// Analysis of video play durations to determine user engagement
		/// </summary>
		public float? generateMediaAnalysisUserEngagement(int mediaID)
		{
			avgMediaViewDurationPercentage = 0;
			float outValue;
			try
			{
				con.Open();
				SqlCommand avgWatchLength = new SqlCommand(@"SELECT AVG(WatchLength) AS AverageWatchLength FROM
															UserHistory AS uh
															INNER JOIN Media AS m
															ON uh.MediaID = m.MediaID
															LEFT OUTER JOIN [User] as u
															ON u.[UID] = uh.[UID]
															WHERE uh.MediaID = @mediaID
															AND u.EmploymentStatus = 'A'
															AND MediaTypeID = 2", con);
				avgWatchLength.CommandType = CommandType.Text;
				avgWatchLength.Parameters.AddWithValue("@mediaID", ((object)mediaID) ?? DBNull.Value);
				SqlDataReader rdr = avgWatchLength.ExecuteReader();
				if (rdr.Read())
                {
					avgMediaViewDurationPercentage = float.TryParse(rdr["AverageWatchLength"].ToString(), out outValue) ? (float?)outValue : null;
				}
				con.Close();
			}
			catch (SqlException ex)
			{
				for (int i = 0; i < ex.Errors.Count; i++)
				{
					Console.WriteLine($"Index # {i} Error: {ex.Errors[i].ToString()}");
				}
			}

			return avgMediaViewDurationPercentage;

		}

		/// <summary>
		/// For a selected user, what media items were opened or played.
		/// </summary>
		public List<MediaItem> generateUserOpenOrPlayItems(string uid) {
			userWatchedMedias = new List<MediaItem>();
			try
			{
				con.Open();
				SqlCommand userMediaItems = new SqlCommand(@"SELECT m.* FROM
															UserHistory as uh
															INNER JOIN Media as m
															ON m.MediaID = uh.MediaID
															WHERE [UID] = @userID
															AND m.MediaStatus = 'A';", con);
				userMediaItems.CommandType = CommandType.Text;
				userMediaItems.Parameters.AddWithValue("@userID", ((object)uid) ?? DBNull.Value);
				SqlDataReader rdr = userMediaItems.ExecuteReader();
				
				while (rdr.Read())
				{
					var media = new MediaItem(){};
					foreach (var prop in media.GetType().GetProperties())
					{
						media.GetType().GetProperty(prop.Name).SetValue(media, rdr[prop.Name] == DBNull.Value ? null : rdr[prop.Name], null);
					}
					userWatchedMedias.Add(media);
				}
				con.Close();
			}
			catch (SqlException ex)
			{
				for (int i = 0; i < ex.Errors.Count; i++)
				{
					Console.WriteLine($"Index # {i} Error: {ex.Errors[i].ToString()}");
				}
			}
			return userWatchedMedias;
		}

		/// <summary>
		/// Get report of specific media item and which users opened it or played it (for videos)
		/// </summary>
		public List<User> getMediaItemOpenedUsers(int mediaID)
		{
			mediaOpenedOrPlayedUsers = new List<User>();
			try
			{
				con.Open();
				SqlCommand userMediaItems = new SqlCommand(@"SELECT u.* FROM
															UserHistory as uh
															INNER JOIN [User] as u
															ON u.[UID] = uh.[UID]
															WHERE uh.MediaID = @mediaID
															AND u.EmploymentStatus = 'A';", con);
				userMediaItems.CommandType = CommandType.Text;
				userMediaItems.Parameters.AddWithValue("@mediaID", ((object)mediaID) ?? DBNull.Value);
				SqlDataReader rdr = userMediaItems.ExecuteReader();

				while (rdr.Read())
				{
					var user = new User(){};
					foreach (var prop in user.GetType().GetProperties())
					{
						user.GetType().GetProperty(prop.Name).SetValue(user, rdr[prop.Name] == DBNull.Value ? null : rdr[prop.Name], null);
					}
					mediaOpenedOrPlayedUsers.Add(user);
				}
				con.Close();
			}
			catch (SqlException ex)
			{
				for (int i = 0; i < ex.Errors.Count; i++)
				{
					Console.WriteLine($"Index # {i} Error: {ex.Errors[i].ToString()}");
				}
			}
			return mediaOpenedOrPlayedUsers;
		}

	}
}
