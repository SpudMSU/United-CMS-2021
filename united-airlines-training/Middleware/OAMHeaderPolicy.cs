using System.Collections.Generic;

namespace united_airlines_training.Middleware
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Header policy class for handling request headers from OAM
    /// </summary>
    public class OAMHeaderPolicy
    {
        public IList<string> Headers { get; }
        = new List<string>();
    }
}
