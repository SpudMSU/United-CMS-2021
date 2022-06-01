using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using united_airlines_training.Models;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// Interacts with the SQL Server database's Channel Relationship entities.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class NestedChannelController : ControllerBase
    {
        // database connection context
        private readonly tomtcmsContext _context;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public NestedChannelController(tomtcmsContext context)
        {
            _context = context;
        }

        // GET: api/NestedChannel
        /// <summary>
        /// Get the list of all channel relationships from the database
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NestedChannel>>> GetAllNestedChannels()
        {
            return await _context.NestedChannel.ToListAsync();
        }

        // GET: api/NestedChannel/5
        // [HttpGet("{id}")]
        /// <summary>
        /// getter for a specific parent child channel relationship in the database
        /// </summary>
        /// <param name="parentID"></param>
        /// <param name="childID"></param>
        /// <remarks>Changes to this function must be 
        /// reflected in the PostNestedChannel function</remarks>
        /// <returns></returns>
        public async Task<ActionResult<NestedChannel>> GetNestedChannel(int parentID, int childID)
        {
            var nestedChannel = await _context.NestedChannel.Where(n => n.ParentId == parentID && n.ChildId == childID).ToListAsync();

            if (nestedChannel == null || nestedChannel.Count != 1)
            {
                return NotFound();
            }

            return nestedChannel[0];
        }

        // POST: api/NestedChannel
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        /// <summary>
        /// Create a new nested channel relationship in the database
        /// </summary>
        /// <param name="nestedChannel"></param>
        /// <returns> the nested channel as it appears in the database</returns>
        [HttpPost]
        public async Task<ActionResult<NestedChannel>> PostNestedChannel(NestedChannel nestedChannel)
        {
            bool isValid = await ValidRelationship(nestedChannel.ParentId, nestedChannel.ChildId);
            if (!isValid) 
            { return Conflict("New channel relationship is invalid"); }

            _context.NestedChannel.Add(nestedChannel);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (NestedChannelExists(nestedChannel.ParentId, nestedChannel.ChildId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetNestedChannel", new 
            { parentID = nestedChannel.ParentId, childID = nestedChannel.ChildId }, nestedChannel);
        }

        // DELETE: api/NestedChannel/5
        /// <summary>
        /// Remove a nested channel relationship from the database
        /// </summary>
        /// <param name="parentID"></param>
        /// <param name="childID"></param>
        /// <returns></returns>
        [HttpDelete("singleRelation/{parentID}/{childID}")]
        public async Task<ActionResult<NestedChannel>> DeleteRelationship(int parentID, int childID)
        {
            var nestedChannel = await _context.NestedChannel.Where(n => n.ParentId == parentID && n.ChildId == childID).ToListAsync();

            if (nestedChannel == null || nestedChannel.Count != 1)
            {
                return NotFound();
            }
            _context.NestedChannel.Remove(nestedChannel[0]);
            await _context.SaveChangesAsync();

            return nestedChannel[0];
        }
        /// <summary>
        /// Given a channelID, removes any relationships
        /// which had that channelid as either a parent or child.
        /// If the channel had a parent, any of its children will be 
        /// assigned to that parent
        /// </summary>
        /// <param name="channelID"></param>
        /// <returns>Always null</returns>
        [HttpDelete("allRelations/{channelID}")]
        public async Task<ActionResult<NestedChannel>> DeleteChannelRelationships(int channelID)
        {
            var children = await _context.NestedChannel.Where(n => n.ParentId == channelID).ToListAsync();
            var parents = await _context.NestedChannel.Where(n => n.ChildId == channelID).ToListAsync();
            
            if (parents == null && children == null)
            {
                return NotFound("channel has no relationships");
            }
            int defaultParent = -1;
            if (parents != null && parents.Count > 0)
            {
                defaultParent = parents[0].ParentId;
            }
            //remove all children
            foreach (NestedChannel rel in children)
            {
                _context.NestedChannel.Remove(rel);
                await _context.SaveChangesAsync();
                if (defaultParent != -1)
                {
                    // change all children to be parented by the deleted channel's first parent
                    rel.ParentId = defaultParent;
                    await PostNestedChannel(rel);
                    await _context.SaveChangesAsync();
                }
            }
            // remove all parents
            foreach (NestedChannel rel in parents)
            {
                _context.NestedChannel.Remove(rel);
                await _context.SaveChangesAsync();
            }
            return null;
        }

        /// <summary>
        /// Returns true if the specified relationship 
        /// exists in the database
        /// </summary>
        /// <param name="pid"></param>
        /// <param name="cid"></param>
        /// <returns></returns>
        private bool NestedChannelExists(int pid, int cid)
        {
            return _context.NestedChannel.Any(e => e.ParentId == pid && e.ChildId == cid);
        }

        /// <summary>
        /// Returns true if the proposed parent-child relationship can exist
        /// </summary>
        /// <param name="parentID"></param>
        /// <param name="childID"></param>
        /// <returns></returns>
        private async Task<bool> ValidRelationship(int parentID, int childID)
        {
            // can't connect something to itself
            if (parentID == childID) 
            { return false; }
            // make sure that the child is not a parent of the parent
            Channel[] childsChildren = (await GetAllChildren(childID)).ToArray();
            foreach(Channel child in childsChildren)
            {
                if (child.ChannelID == parentID)
                {
                    // the parent is a sub-child of the proposed child
                    // this relationship cannot exist
                    return false;
                }
            }
            // make sure that the child is not already a 
            // sub-child of this parent
            Channel[] parentsChildren = (await GetAllChildren(parentID)).ToArray();
            foreach (Channel child in parentsChildren)
            {
                if (child.ChannelID == childID)
                { return false; }
            }
            return true;
        }

        /// <summary>
        /// Getter for the list of channels which are the 
        /// immediate children of the parameter channel
        /// </summary>
        /// <param name="channelID"></param>
        /// <returns></returns>
        [HttpGet("children/{channelID}")]
        public async Task<ActionResult<IEnumerable<Channel>>> GetChildren(int channelID)
        {
            // get all of their IDS
            var mediaconnections = await _context.NestedChannel.Where(n => n.ParentId == channelID).ToListAsync();

            // get the list of channels
            List<Channel> channels = new List<Channel>();
            foreach (var mcCon in mediaconnections)
            {
                var curChan = await _context.Channel.FindAsync(mcCon.ChildId);
                if (curChan != null)
                {
                    channels.Add(curChan);
                }
            }
            return new ActionResult<IEnumerable<Channel>>(channels);
        }

        [HttpGet("{childID}")]
        public async Task<int> getParentId(int childID)
        {
            try
            {
                string has = _context.NestedChannel.Any(s => s.ChildId == childID).ToString();
                if (has == "True")
                {
                    var entry = _context.NestedChannel.Where(s => s.ChildId == childID).ToListAsync();
                    var s = entry.Result.First().ParentId;
                    return s;
                }
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
            }
            return -1;
            
        }

        public async Task<IEnumerable<Channel>> getBaseChannels()
        {
            List<Channel> result = new List<Channel>();
            try
            {
                IEnumerable<Channel> channels = _context.Channel;
                foreach (Channel i in channels)
                {
                    if (getParentId(i.ChannelID).Result == -1)
                    {
                        result.Add(i);
                    }
                }
            } catch(Exception e)
            {
               
            }
            return result;

        }
        /// <summary>
        /// Getter for the list of all children
        /// and sub children of a given channel
        /// </summary>
        /// <param name="channelID"></param>
        /// <param name="originalCaller">Set to the original channelID parameter value
        /// only specify this value from a recursive call within this function</param>
        /// <returns></returns>
        public async Task<IEnumerable<Channel>> GetAllChildren(int channelID, int originalCaller = -1)
        {
            // get base children
            List<Channel> allChildren = new List<Channel>();
            Channel[] baseChildren = (await GetChildren(channelID)).Value.ToArray();
            if (baseChildren != null && baseChildren.Length > 0)
            {
                allChildren.AddRange(baseChildren);
                foreach (Channel child in baseChildren)
                {
                    if (child.ChannelID == channelID || child.ChannelID == originalCaller)
                    {
                        int issueChannel = originalCaller == -1 ? channelID : originalCaller;
                        throw new Exception("Infinite nested relationship detected on channel " + issueChannel);
                    }
                    // recursively add all sub children
                    if (originalCaller == -1)
                    {
                        allChildren.AddRange(await GetAllChildren(child.ChannelID, channelID));
                    }
                    else
                    {
                        allChildren.AddRange(await GetAllChildren(child.ChannelID, originalCaller));
                    }
                }
            }
            return allChildren;
        }
    }
}
