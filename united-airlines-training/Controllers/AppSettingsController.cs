using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// General appsettings controller to retrieve all miscellaneous app settings variables for each page
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class AppSettingsController : ControllerBase
    {
        private readonly IConfiguration _config;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public AppSettingsController(IConfiguration configuration) {
            _config = configuration;
        }

        /// <summary>
        /// GET: api/AppSettings/Help
        /// Get help settings
        /// </summary>
        /// <returns></returns>
        [HttpGet("Help")]
        public IActionResult GetHelpContent()
        {
            string phone = _config.GetValue<string>("HelpPage:phone");
            string email = _config.GetValue<string>("HelpPage:email");
            string faq = _config.GetValue<string>("HelpPage:faq-help-url");
            bool enabled = _config.GetValue<bool>("HelpPage:pageEnabled");
            return Ok(new { enabled, phone, email, faq });
        }

        /// <summary>
        /// GET: api/AppSettings/About
        /// Get about settings
        /// </summary>
        /// <returns></returns>
        [HttpGet("About")]
        public IActionResult GetAboutContent()
        {
            string description = _config.GetValue<string>("AboutPage:description");
            bool enabled = _config.GetValue<bool>("AboutPage:pageEnabled");
            return Ok(new { enabled, description });
        }


        /// <summary>
        /// GET: api/AppSettings/AutoPlay
        /// Determine if media item videos should be auto played on page load
        /// </summary>
        /// <returns></returns>
        [HttpGet("AutoPlay")]
        public IActionResult GetVideoAutoplay()
        {
            bool autoplay = _config.GetValue<bool>("MediaPage:videoAutoPlay");
            return Ok(new { autoplay });
        }

      [HttpGet("DefaultThumbnail")]
      public IActionResult GetDefaultThumbnail()
      {
         string defaultImage = _config.GetValue<string>("defaultThumbnailPath");
         return Ok(new { defaultImage });
      }

      [HttpGet("AutoApproveComments")]
      public IActionResult GetAutoApproveComments()
      {
         bool autoApprove = _config.GetValue<bool>("Commenting:autoApproval");
         return Ok(new { autoApprove });
      }

      [HttpGet("CommentingSettings")]
      public IActionResult GetCommentingSettings()
      {
         bool commentingEnabled = _config.GetValue<bool>("MediaPage:commentingEnabled");
         bool commentingDisabledBannerVisible = _config.GetValue<bool>("MediaPage:commentingDisabledBannerVisible");
         string commentingDisabledBanner = _config.GetValue<string>("MediaPage:commentingDisabledBanner");
         return Ok(new { commentingEnabled, commentingDisabledBannerVisible, commentingDisabledBanner });
      }
    }

}
