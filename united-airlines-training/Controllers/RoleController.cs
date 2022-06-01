using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using united_airlines_training.Models;

namespace united_airlines_training.Controllers
{
    /// <summary>
    /// Author: N/A
    /// This controller may not be used anywhere right now (not sure)
    /// -
    /// Interacts with the SQL Server database's Role entities.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        // database connection context
        private readonly tomtcmsContext _context;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="context">Azure Database context used to connect to SQL Server</param>
        public RoleController(tomtcmsContext context)
        {
            _context = context;
        }

        // GET: api/Role
        /// <summary>
        /// Get the list of all roles from the database
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            return await _context.Role.ToListAsync();
        }

        // GET: api/Role/5
        /// <summary>
        /// Getter for a specific role by its ID
        /// </summary>
        /// <param name="id"></param>
        /// <remarks>Changes to this function must be reflected
        /// in the PostRole function</remarks>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRole(int id)
        {
            var role = await _context.Role.FindAsync(id);

            if (role == null)
            {
                return NotFound();
            }

            return role;
        }

        // PUT: api/Role/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        /// <summary>
        /// Update a role in the database
        /// </summary>
        /// <param name="id">original id of the updating role</param>
        /// <param name="role">new data to record for the existing role record</param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRole(int id, Role role)
        {
            if (id != role.RoleID)
            {
                return BadRequest();
            }

            _context.Entry(role).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RoleExists(id))
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

        // POST: api/Role
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        /// <summary>
        /// Add a new role to the database 
        /// </summary>
        /// <param name="role"> data for the new role record (ID of this will be automatically changed)</param>
        /// <returns>the inputted role data as it appears in the database (with updated id)</returns>
        [HttpPost]
        public async Task<ActionResult<Role>> PostRole(Role role)
        {
            _context.Role.Add(role);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RoleExists(role.RoleID))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetRole", new { id = role.RoleID }, role);
        }

        // DELETE: api/Role/5
        /// <summary>
        /// Remove the role with the given ID from the database
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<Role>> DeleteRole(int id)
        {
            var role = await _context.Role.FindAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            _context.Role.Remove(role);
            await _context.SaveChangesAsync();

            return role;
        }

        /// <summary>
        /// True if there is a role in the database that has the provided ID
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        private bool RoleExists(int id)
        {
            return _context.Role.Any(e => e.RoleID == id);
        }
    }
}
