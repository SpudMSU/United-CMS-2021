namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// Represents a channel relationship (parent to child)
    /// </summary>
    public partial class NestedChannel
    {
        public int ParentId { get; set; }
        public int ChildId { get; set; }
    }
}
