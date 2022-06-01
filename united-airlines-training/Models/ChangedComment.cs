using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace united_airlines_training.Models
{
    public class ChangedComment
    {

        [Key]
        public int ChangeID { get; set; }
#nullable enable
        public string? UID { get; set; }
        public int? MediaID { get; set; }
        public int? CommentID { get; set; }
        public string? Description { get; set; }
        public bool? Queued { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? ParentId { get; set; }
    }
}
