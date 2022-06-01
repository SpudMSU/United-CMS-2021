using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MimeKit.Text;
using united_airlines_training.Helpers;
using united_airlines_training.Models;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Media feedback controller to make CRUD function calls and allow to read and write to MSSQL database
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class MediaFeedbackController : Controller
    {
        private readonly tomtcmsContext _context;
        private readonly IConfiguration _config;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        /// <param name="configuration">Configuration to get appsettings values</param>
        public MediaFeedbackController(tomtcmsContext context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
        }

        /// <summary>
        /// GET: api/MediaFeedback
        /// Get all media feedback rows found in database table
        /// </summary>
        /// <returns>Media feedback found in table</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MediaFeedback>>> GetMediaFeedback()
        {
            return await _context.MediaFeedback.ToListAsync();
        }

        /// <summary>
        /// GET: api/MediaFeedback/5
        /// Get a specific media feedback by primary key
        /// </summary>
        /// <returns>Media feedback item found</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<MediaFeedback>> GetMediaFeedback(int id)
        {
            var mediaFeedback = await _context.MediaFeedback.FindAsync(id);

            if (mediaFeedback == null)
            {
                return NotFound();
            }

            return mediaFeedback;
        }

        /// <summary>
        /// PUT: api/MediaFeedback/5
        /// Update media feedback
        /// </summary>
        /// <returns>Media feedback row updated</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMediaFeedback(int id, MediaFeedback mediaFeedback)
        {
            if (id != mediaFeedback.MediaFeedbackID)
            {
                return BadRequest();
            }

            _context.Entry(mediaFeedback).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MediaFeedbackExists(id))
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
        /// POST: api/MediaFeedback
        /// Create a new media feedback row in database
        /// </summary>
        /// <returns>Media feedback row inserted</returns>
        [HttpPost]
        public async Task<ActionResult<MediaFeedback>> PostMediaFeedback(FeedbackUserData data)
        {
            var mediaFeedback = data.MFeedback;
            mediaFeedback.CreatedAt = mediaFeedback.CreatedAt.ToLocalTime();

            _context.MediaFeedback.Add(mediaFeedback);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (MediaFeedbackExists(mediaFeedback.MediaFeedbackID))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            if (ModelState.IsValid)
            {
                try
                {
                    // Email Config
                    if (_config.GetValue<int>("EmailConfiguration:intSendUsing") == 1)
                    {
                        string pickupDirectory = _config.GetValue<string>("EmailConfiguration:strSMTPServerPickupDirectory");
                    }
                    int port = _config.GetValue<int>("EmailConfiguration:intSMTPServerPort");
                    string smtp = _config.GetValue<string>("EmailConfiguration:strSMTPServer");
                    bool ssl = _config.GetValue<bool>("EmailConfiguration:blnSMTPUseSSL");
                    int timeout = _config.GetValue<int>("EmailConfiguration:intSMTPConnectionTimeout");
                    int authMethod = _config.GetValue<int>("EmailConfiguration:intSMTPAuthenticate");

                    // Email Content
                    string emailBody = "";
                    string from = "";
                    var message = new MimeMessage();

                    if (_config.GetValue<string>("EmailContent:from") != "")
                        from = _config.GetValue<string>("EmailContent:from");
                    else
                        from = data.UFeedback.Email;

                    List<string> to = _config.GetSection("EmailContent:to").Get<List<string>>() ?? null;
                    List<string> cc = _config.GetSection("EmailContent:cc").Get<List<string>>() ?? null;
                    List<string> bc = _config.GetSection("EmailContent:bc").Get<List<string>>() ?? null;

                    if (to != null)
                    {
                        //Setting the To Email address
                        InternetAddressList listTo = new InternetAddressList();
                        foreach (var rec in to)
                        {
                            listTo.Add(new MailboxAddress(rec));
                        }
                        if (listTo.Count > 0)
                            message.To.AddRange(listTo);
                    }

                    if (cc != null)
                    {
                        //Setting the CC Email address
                        InternetAddressList listCC = new InternetAddressList();
                        foreach (var rec in cc)
                        {
                            listCC.Add(new MailboxAddress(rec));
                        }
                        message.Cc.AddRange(listCC);
                    }

                    if (bc != null)
                    {
                        //Setting the BCC Email address
                        InternetAddressList listBCC = new InternetAddressList();
                        foreach (var rec in bc)
                        {
                            listBCC.Add(new MailboxAddress(rec));
                        }
                        if (listBCC.Count > 0)
                            message.Bcc.AddRange(listBCC);
                    }

                    // Setting the From Email address
                    //message.From.Add(new MailboxAddress(from));
                    message.From.Add(new MailboxAddress(data.UFeedback.FirstName + " " + data.UFeedback.LastName, from));
                    // Email subject 
                    message.Subject = data.Subject;

                    ViewBag.emailContent = mediaFeedback;
                    ViewBag.userContent = data.UFeedback;
                    ViewBag.phone = data.Phone;
                    ViewBag.mediaTitle = data.MediaTitle;
                    ViewBag.contact = false;

                    // Email message body
                    emailBody = EmailHelper.RenderView(this, "FeedbackEmailTemplate", null);

                    message.Body = new TextPart(TextFormat.Html)
                    {
                        Text = emailBody
                    };
                    //Configure the e-mail
                    using (var emailClient = new SmtpClient())
                    {
                        emailClient.Connect(smtp, port, ssl);
                        if (authMethod == 1 || authMethod == 2)
                        {
                            string sendUser = _config.GetValue<string>("EmailConfiguration:strSendUsername");
                            string sendPass = _config.GetValue<string>("EmailConfiguration:strSendPassword");
                            emailClient.Authenticate(sendUser, sendPass);   // could be wrong. Might need to be outside conditional always
                        }
                        emailClient.Send(message);
                        emailClient.Disconnect(true);
                    }
                }
                catch (Exception e)
                {

                    ModelState.Clear();
                    ViewBag.Exception = $"Error:  {e.Message}";
                }

            }
            return CreatedAtAction("GetMediaFeedback", new { id = mediaFeedback.MediaFeedbackID }, mediaFeedback);
        }

        /// <summary>
        /// DELETE: api/MediaFeedback/5
        /// Delete media feedback from database
        /// </summary>
        /// <returns>media feedback row deleted</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<MediaFeedback>> DeleteMediaFeedback(int id)
        {
            var mediaFeedback = await _context.MediaFeedback.FindAsync(id);
            if (mediaFeedback == null)
            {
                return NotFound();
            }

            _context.MediaFeedback.Remove(mediaFeedback);
            await _context.SaveChangesAsync();

            return mediaFeedback;
        }

        private bool MediaFeedbackExists(int id)
        {
            return _context.MediaFeedback.Any(e => e.MediaFeedbackID == id);
        }
    }
}
