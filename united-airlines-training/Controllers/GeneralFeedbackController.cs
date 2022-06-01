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
using Newtonsoft.Json.Linq;
using united_airlines_training.Helpers;
using united_airlines_training.Models;

namespace united_airlines_training.Controllers
{
    public class EmailData
    {
        public FeedbackUserData data { get; set; }
#nullable enable
        public string? contactTo { get; set; }
        public List<string>? to { get; set; }
        public List<string>? cc { get; set; }
        public List<string>? bc { get; set; }
        public bool? contact { get; set; }
        public bool? mediaFeedback { get; set; }
#nullable disable
    }

    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// General feedback controller to make CRUD function calls and allow to read and write to MSSQL database
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class GeneralFeedbackController : Controller
    {
        private readonly tomtcmsContext _context;
        private readonly IConfiguration _config;
        private readonly int port;
        private readonly string smtp;
        private readonly bool ssl;
        private readonly string pickupDirectory;
        private readonly int timeout;

        /// <summary>
        /// General feedback controller constructor which gets all appsetting email configuration data
        /// </summary>
        /// <returns></returns>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        /// <param name="configuration">Configuration to get appsettings values</param>
        public GeneralFeedbackController(tomtcmsContext context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
            // Email Config
            if (_config.GetValue<int>("EmailConfiguration:intSendUsing") == 1)
            {
                pickupDirectory = _config.GetValue<string>("EmailConfiguration:strSMTPServerPickupDirectory");
            }
            port = _config.GetValue<int>("EmailConfiguration:intSMTPServerPort");
            smtp = _config.GetValue<string>("EmailConfiguration:strSMTPServer");
            ssl = _config.GetValue<bool>("EmailConfiguration:blnSMTPUseSSL");
            timeout = _config.GetValue<int>("EmailConfiguration:intSMTPConnectionTimeout");
        }

        /// <summary>
        /// GET: api/GeneralFeedback
        /// Get all general feedback in database table
        /// </summary>
        /// <returns>All general feedback rows found</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GeneralFeedback>>> GetGeneralFeedback()
        {
            return await _context.GeneralFeedback.ToListAsync();
        }

        
        /// <summary>
        /// GET: api/GeneralFeedback/5
        /// Get specific general feedback ID
        /// </summary>
        /// <returns>General feedback row found or NotFound() [404 Error]</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<GeneralFeedback>> GetGeneralFeedback(int id)
        {
            var generalFeedback = await _context.GeneralFeedback.FindAsync(id);

            if (generalFeedback == null)
            {
                return NotFound();
            }

            return generalFeedback;
        }

        // PUT: api/GeneralFeedback/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGeneralFeedback(int id, GeneralFeedback generalFeedback)
        {
            if (id != generalFeedback.GeneralFeedbackId)
            {
                return BadRequest();
            }

            _context.Entry(generalFeedback).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GeneralFeedbackExists(id))
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

        // POST: api/GeneralFeedback
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<GeneralFeedback>> PostGeneralFeedback(FeedbackUserData data)
        {
            var generalFeedback = data.GFeedback;
            generalFeedback.CreatedAt = generalFeedback.CreatedAt.ToLocalTime();

            _context.GeneralFeedback.Add(generalFeedback);
            await _context.SaveChangesAsync();

            if (ModelState.IsValid)
            {
                try
                {
                    List<string> to = _config.GetSection("EmailContent:to").Get<List<string>>() ?? null;
                    List<string> cc = _config.GetSection("EmailContent:cc").Get<List<string>>() ?? null;
                    List<string> bc = _config.GetSection("EmailContent:bc").Get<List<string>>() ?? null;
                    EmailData eData = new EmailData() { data = data, to = to, contactTo = null, bc = bc, cc = cc, contact = false, mediaFeedback = false };
                    SendEmail(eData);
                }
                catch (Exception e)
                {

                    ModelState.Clear();
                    ViewBag.Exception = $"Error:  {e.Message}";
                }

            }
            return CreatedAtAction("GetGeneralFeedback", new { id = generalFeedback.GeneralFeedbackId }, generalFeedback);
        }


        // POST: api/GeneralFeedback/contact
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost("contact")]
        public void CreateContactEmail(FeedbackUserData data)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    string contactTo = _config.GetValue<string>("HelpPage:email");
                    EmailData eData = new EmailData(){ data = data, to = null, contactTo = contactTo, bc = null, cc = null, contact = true, mediaFeedback = false };
                    SendEmail(eData);
                }
                catch (Exception e)
                {
                    ModelState.Clear();
                    ViewBag.Exception = $"Error:  {e.Message}";
                }

            }
        }

        /// <summary>
        /// General Email sender function
        /// </summary>
        /// <returns></returns>
        public void SendEmail(EmailData eData)
        {
            MediaFeedback mediaFeedback = null;
            GeneralFeedback generalFeedback = null;
            // Determine if it is media feedback or generaal feedback that you are sending
            if (eData.mediaFeedback == true)
            {
                mediaFeedback = eData.data.MFeedback;
                mediaFeedback.CreatedAt = mediaFeedback.CreatedAt.ToLocalTime();
                ViewBag.emailContent = mediaFeedback;
            } else
            {
                generalFeedback = eData.data.GFeedback;
                generalFeedback.CreatedAt = generalFeedback.CreatedAt.ToLocalTime();
                ViewBag.emailContent = generalFeedback;
            }

            // Email Content
            string emailBody = "";
            string from = "";
            var message = new MimeMessage();

            if (_config.GetValue<string>("EmailContent:from") != "")
                from = _config.GetValue<string>("EmailContent:from");
            else
                from = eData.data.UFeedback.Email;

            if (eData.to != null)
            {
                //Setting the To Email address
                InternetAddressList listTo = new InternetAddressList();
                foreach (var rec in eData.to)
                {
                    listTo.Add(new MailboxAddress(rec));
                }
                if (listTo.Count > 0)
                    message.To.AddRange(listTo);
            } else
            {
                if (eData.contact == true)
                    message.To.Add(new MailboxAddress(eData.contactTo));
            }

            if (eData.cc != null)
            {
                //Setting the CC Email address
                InternetAddressList listCC = new InternetAddressList();
                foreach (var rec in eData.cc)
                {
                    listCC.Add(new MailboxAddress(rec));
                }
                message.Cc.AddRange(listCC);
            }

            if (eData.bc != null)
            {
                //Setting the BCC Email address
                InternetAddressList listBCC = new InternetAddressList();
                foreach (var rec in eData.bc)
                {
                    listBCC.Add(new MailboxAddress(rec));
                }
                if (listBCC.Count > 0)
                    message.Bcc.AddRange(listBCC);
            }


            // Setting the From Email address
            message.From.Add(new MailboxAddress(eData.data.UFeedback.FirstName + " " + eData.data.UFeedback.LastName, from));
            // Email subject 
            message.Subject = eData.data.Subject;

            // Email template data for the email View
            ViewBag.userContent = eData.data.UFeedback;
            ViewBag.phone = eData.data.Phone;
            ViewBag.mediaTitle = eData.data.MediaTitle;
            ViewBag.contact = eData.contact;
            // Email message body
            emailBody = EmailHelper.RenderView(this, "FeedbackEmailTemplate", null);
            message.Body = new TextPart(TextFormat.Html)
            {
                Text = emailBody
            };
            //Configure the e-mail
            using (SmtpClient emailClient = new SmtpClient())
            {
                emailClient.Connect(smtp, port, ssl);
                int authMethod = _config.GetValue<int>("EmailConfiguration:intSMTPAuthenticate");
                string sendUser = _config.GetValue<string>("EmailConfiguration:strSendUsername");
                string sendPass = _config.GetValue<string>("EmailConfiguration:strSendPassword");
                if (eData.contact == true)
                {
                    authMethod = _config.GetValue<int>("HelpPage:intSMTPAuthenticate");
                    sendUser = _config.GetValue<string>("HelpPage:strSendUsername");
                    sendPass = _config.GetValue<string>("HelpPage:strSendPassword");
                }

                if (authMethod == 1 || authMethod == 2)
                    emailClient.Authenticate(sendUser, sendPass);
                // SENDS THE EMAIL
                emailClient.Send(message);
                // Make sure to disconnect to avoid it continuously running
                emailClient.Disconnect(true);
            }
        }


        /// <summary>
        /// DELETE: api/GeneralFeedback/5
        /// Delete general feedback from database
        /// </summary>
        /// <returns>General feedback row deleted</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<GeneralFeedback>> DeleteGeneralFeedback(int id)
        {
            var generalFeedback = await _context.GeneralFeedback.FindAsync(id);
            if (generalFeedback == null)
            {
                return NotFound();
            }

            _context.GeneralFeedback.Remove(generalFeedback);
            await _context.SaveChangesAsync();

            return generalFeedback;
        }

        /// <summary>
        /// Determines if general feedback ID exists in database
        /// </summary>
        /// <returns>Boolean to determine if the general feedback does exist or not</returns>
        private bool GeneralFeedbackExists(int id)
        {
            return _context.GeneralFeedback.Any(e => e.GeneralFeedbackId == id);
        }
    }
}
