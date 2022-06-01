namespace united_airlines_training.Middleware
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Builder for building and sending custom middleware to pipeline
    /// </summary>
    public class OAMHeaderBuilder
    {
        private readonly OAMHeaderPolicy _policy = new OAMHeaderPolicy();

        public OAMHeaderBuilder AddDefaultSecurePolicy()
        {
            return this;
        }

        public OAMHeaderPolicy Build()
        {
            return _policy;
        }
    }
}
