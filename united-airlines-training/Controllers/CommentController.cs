using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using united_airlines_training.Models;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Comment controller class to retrieve comments table data from back end
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly tomtcmsContext _context;
      private readonly bool _autoApprove;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public CommentController(
           tomtcmsContext context,
           IConfiguration configuration
           )
        {
            _context = context;
          _autoApprove = configuration.GetValue<bool>("Commenting:autoApproval");
        }

         [HttpGet("ReasonForRejection")]
         public async Task<ActionResult> GetCommentReasonsForRejection()
         {
            return Ok(await _context.CommentReasonForRejection.ToListAsync());
         }

        /// <summary>
        /// GET: api/Comment/media/{mediaId}
        /// Get all approved comments for a particular media
        /// </summary>
        /// <param name="mediaId">ID of media item</param>
        /// <returns>User comments for media</returns>
        [HttpGet("media/{mediaId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetMediaComments(int mediaId)
        {
            if (!MediaExists(mediaId))
            {
                return NotFound();
            }
            var userComments = await _context.Comment.Where(m => m.MediaID == mediaId && m.Queued == false).OrderByDescending(d => d.CreatedAt).ToListAsync();

            return userComments;
        }

        /// <summary>
        /// GET: api/Comment/media/queued/1
        /// Get all queued comments for a particular media
        /// </summary>
        /// <param name="mediaId">ID of media item</param>
        /// <returns>List of queued comments for media</returns>
        [HttpGet("media/queued/{mediaId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetMediaQueuedComments(int mediaId)
        {
            if (!MediaExists(mediaId))
            {
                return NotFound();
            }
            var queuedComments = await _context.Comment.Where(m => m.MediaID == mediaId && m.Queued == true).OrderByDescending(d => d.CreatedAt).ToListAsync();

            return queuedComments;
        }

        /// <summary>
        /// GET: api/Comment/user/1
        /// Get all approved comments for a user
        /// </summary>
        /// <param name="uid">ID of user</param>
        /// <returns>All user comments</returns>
        [HttpGet("user/{uid}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetUserComments(string uid)
        {
            if (!UserExists(uid))
            {
                return NotFound();
            }
            var userComments = await _context.Comment.Where(m => m.UID == uid && m.Queued == false).OrderByDescending(d => d.CreatedAt).ToListAsync();

            return userComments;
        }


        /// <summary>
        /// GET: api/Comment/user/queued/1
        /// Get queued comments for a user
        /// </summary>
        /// <param name="uid">ID of user</param>
        /// <returns>All user comments that are queued for that particular user</returns>
        [HttpGet("user/queued/{uid}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetUserQueuedComments(string uid)
        {
            if (!UserExists(uid))
            {
                return NotFound();
            }
            var queuedUserComments = await _context.Comment.Where(m => m.UID == uid && m.Queued == true).OrderByDescending(d => d.CreatedAt).ToListAsync();

            return queuedUserComments;
        }

        /// <summary>
        /// GET: api/Comment/media/1/user/1
        /// Get user comment(s) for a particular media item
        /// </summary>
        /// <param name="mediaId">ID of media</param>
        /// <param name="uid">ID of user</param>
        /// <returns>All user comments for that particular media item</returns>
        [HttpGet("media/{mediaId}/user/{uid}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetUserMediaComments(int mediaId, string uid)
        {

            if (!MediaExists(mediaId))
            {
                return NotFound();
            }

            var userComments = await _context.Comment.Where(m => m.MediaID == mediaId && m.UID == uid && m.Queued == false).ToListAsync();
            if (userComments.Count() < 1)
            {
                return NoContent();
            }
            return userComments;
        }

        /// <summary>
        /// GET: api/Comment/approved
        /// Get all approved comments
        /// </summary>
        /// <returns>All approved comments</returns>
        [HttpGet("approved")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetAllApprovedComments()
        {

            var approvedComments = await _context.Comment.Where(m => m.Queued == false).ToListAsync();
            if (approvedComments.Count() < 1)
            {
                return NoContent();
            }
            return approvedComments;
        }

        /// <summary>
        /// GET: api/Comment/queued
        /// Get user comment(s) for a particular media item
        /// </summary>
        /// <returns>All queued comments</returns>
        [HttpGet("queued")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetAllQueuedComments()
        {

            var queuedComments = await _context.Comment.Where(m => m.Queued == true).ToListAsync();
            if (queuedComments.Count() < 1)
            {
                return NoContent();
            }
            return queuedComments;
        }

        /// <summary>
        /// GET: api/Comment/media/1/user/queued/1
        /// Get queued user comment(s) for a particular media item
        /// </summary>
        /// <param name="mediaId">ID of media</param>
        /// <param name="uid">ID of user</param>
        /// <returns>All user comments queued for a particular media</returns>
        [HttpGet("media/{mediaId}/user/queued/{uid}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetUserMediaQueuedComments(int mediaId, string uid)
        {
            if (!MediaExists(mediaId))
            {
                return NotFound();
            }

            var queuedUserMediaComments = await _context.Comment.Where(m => m.MediaID == mediaId && m.UID == uid && m.Queued == true).ToListAsync();
            if (queuedUserMediaComments.Count() < 1)
            {
                return NoContent();
            }
            return queuedUserMediaComments;
        }

        /// <summary>
        /// GET: api/Comment
        /// Get all comments
        /// </summary>
        /// <returns>All comments in database table</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComment()
        {
            return await _context.Comment.ToListAsync();
        }

        /// <summary>
        /// GET: api/Comment/user/5/media/5/comment/5
        /// Get specific user comment on a media item
        /// </summary>
        /// <param name="id">User ID primary key in database</param>
        /// <param name="mediaid">Media ID primary key in database</param>
        /// <param name="commentid">Comment ID primary key in database</param>
        /// <returns>Specific comment</returns>
        [HttpGet("user/{id}/media/{mediaid}/comment/{commentid}")]
        public async Task<ActionResult<Comment>> GetComment(string id, int mediaid, int commentid)
        {
            var comment = await _context.Comment.FindAsync(id, mediaid, commentid);

            if (comment == null)
            {
                return NotFound();
            }

            return comment;
        }

      /// <summary>
      /// Retrieve all of the root comments for a given media item (comments that don't have any sub-comments)
      /// </summary>
      /// <param name="mediaId">the ID of the media item to get the comments of </param>
      /// <param name="approved">boolean to specify whether to get queued comments or approved comments (true for approved)</param>
      /// <returns></returns>
      [HttpGet("media/{mediaId}/root/approved/{approved}")]
      public async Task<ActionResult<List<Comment>>> GetMediaItemApprovedRootComments(int mediaId, bool approved)
      {
         if (!MediaExists(mediaId))
         {
            return NotFound();
         }
         var mediaComments = await _context.Comment.Where(ele => ele.Queued == !approved && ele.MediaID == mediaId).ToListAsync();
         List<Comment> rootComments = new List<Comment>();
         foreach(var comment in mediaComments)
         {
            var hasParent = _context.ThreadedComment.Where(c => c.MediaID == mediaId)
               .Any(ele => ele.ChildID == comment.CommentID);
            if (!hasParent)
            {
               rootComments.Add(comment);
            }
         }

         return Ok(rootComments);
      }

      [HttpGet("media/{mediaId}/relationships")]
      public async Task<ActionResult<List<ThreadedComment>>> GetMediaItemCommentRelationships(int mediaId)
      {
         if (!MediaExists(mediaId))
         {
            return NotFound();
         }
         var rel = await _context.ThreadedComment.Where(c => c.MediaID == mediaId).ToListAsync();
         return Ok(rel);
      }

        /// <summary>
        /// PUT: api/Comment/user/5/media/5/comment/5
        /// Update specific user comment on a media item
        /// </summary>
        /// <param name="id">User ID primary key in database</param>
        /// <param name="mediaid">Media ID primary key in database</param>
        /// <param name="commentid">Comment ID primary key in database</param>
        /// <param name="comment">Comment object</param>
        /// <returns>Update a specific comment</returns>
        [HttpPut("user/{id}/media/{mediaid}/comment/{commentid}")]
        public async Task<IActionResult> PutComment(string id, int mediaid, int commentid, Comment comment)
        {
            if (id != comment.UID)
            {
                return BadRequest();
            }

            _context.Entry(comment).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CommentExists(id, mediaid, commentid))
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
        /// POST: api/Comment
        /// Create a new user comment
        /// </summary>
        /// <param name="comment">Comment object</param>
        /// <returns>Newly created comment</returns>
        [HttpPost]
        public async Task<IActionResult> PostComment(Comment comment)
        {
            if (_autoApprove)
            {
               comment.Queued = false;
            }
            _context.Comment.Add(comment);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                if (CommentExists(comment.UID, comment.MediaID, comment.CommentID))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            var completeComment = CreatedAtAction("GetComment", new { id = comment.UID }, comment);

            return Ok(new { comment.Queued, completeComment });
        }


      [HttpPost("{parentId}/reply")]
      public async Task<ActionResult> CreateThreadedComment(int parentId, Comment reply)
      {
         if (!MediaExists(reply.MediaID))
         {
            return NotFound();
         }

         if (_autoApprove)
         {
            reply.Queued = false;
         }
         // First, create the Comment itself
         _context.Comment.Add(reply);

         try
         {
            await _context.SaveChangesAsync();
         }
         catch (DbUpdateException)
         {
            if (CommentExists(reply.UID, reply.MediaID, reply.CommentID))
            {
               return Conflict();
            }
            else
            {
               throw;
            }
         }

         // then, create the threaded comment association
         var threadedComment = new ThreadedComment
         {
            ParentID = parentId,
            ChildID = reply.CommentID,
            MediaID = reply.MediaID
         };
         _context.ThreadedComment.Add(threadedComment);

         try
         {
            await _context.SaveChangesAsync();
         }
         catch (DbUpdateException)
         {
            if (CommentExists(reply.UID, reply.MediaID, reply.CommentID))
            {
               return Conflict();
            }
            else
            {
               throw;
            }
         }

         return Ok(new { reply.Queued, reply} );
      }

      [HttpDelete("media/{mediaId}/comment/{parentId}/reply/{replyId}")]
      public async Task<ActionResult> DeleteThreadedComment(int mediaId, int parentId, int replyId)
      {
         if (!MediaExists(mediaId))
         {
            return NotFound();
         }
         var thread = new ThreadedComment
         {
            ChildID = replyId,
            ParentID = parentId,
            MediaID = mediaId
         };
         _context.ThreadedComment.Remove(thread);

         var reply = await _context.Comment.SingleOrDefaultAsync(ele => ele.CommentID == replyId);

         if (reply == null)
         {
            return NotFound("Threaded comment not found");
         }

         _context.Comment.Remove(reply);

         try
         {
            await _context.SaveChangesAsync();
         }
         catch (DbUpdateException)
         {
            if (!CommentExists(reply.UID, reply.MediaID, reply.CommentID))
            {
               return NotFound("Comment not found");
            }
            else
            {
               throw;
            }
         }

         return Ok();
      }

        /// <summary>
        /// DELETE: api/Comment/user/5/media/5/comment/5
        /// Deletes a specific user comment on a media item
        /// </summary>
        /// <param name="id">User ID primary key in database</param>
        /// <param name="mediaid">Media ID primary key in database</param>
        /// <param name="commentid">Comment ID primary key in database</param>
        /// <returns>Deleted comment</returns>
        [HttpDelete("user/{id}/media/{mediaid}/comment/{commentid}")]
        public async Task<ActionResult<Comment>> DeleteComment(string id, int mediaid, int commentid)
        {
            var comment = await _context.Comment.FindAsync(id, mediaid, commentid);
            if (comment == null)
            {
                return NotFound();
            }
            var threadedComments = await _context.ThreadedComment.Where(ele => ele.ParentID == commentid).ToListAsync();
            foreach (var reply in threadedComments)
            {
               var com = await _context.Comment.FirstOrDefaultAsync(ele => ele.CommentID == reply.ChildID);
               _context.Comment.Remove(com);
               _context.ThreadedComment.Remove(reply);
            }

            _context.Comment.Remove(comment);
            await _context.SaveChangesAsync();

            return comment;
        }

        /// <summary>
        /// Checks to see if given media ID is found in media table
        /// </summary>
        /// <param name="mediaID">Media ID primary key in database</param>
        /// <returns>True or false on whether or not the media exists</returns>
        private bool MediaExists(int mediaID)
        {
            return _context.Media.Any(e => e.MediaID == mediaID);
        }

        /// <summary>
        /// Checks to see if given UID is found in user table
        /// </summary>
        /// <param name="uid">User ID primary key in database</param>
        /// <returns>True or false on whether or not the user exists</returns>
        private bool UserExists(string uid)
        {
            return _context.User.Any(e => e.UID == uid);
        }

        /// <summary>
        /// Checks to see if given media ID, user id, and comment id is found in comment table
        /// </summary>
        /// <param name="id">User ID primary key in database</param>
        /// <param name="mediaid">Media ID primary key in database</param>
        /// <param name="commentid">Comment ID primary key in database</param>
        /// <returns>True or false on whether or not the comment exists</returns>
        private bool CommentExists(string id, int mediaid, int commentid)
        {
            return _context.Comment.Any(e => e.UID == id && e.MediaID == mediaid && e.CommentID == commentid);
        }
    }
}
