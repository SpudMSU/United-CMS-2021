using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace united_airlines_training.Models
{
   public class DistanceLearningMedia
   {
      public int MediaId { get; set; }

      public string Instructions { get; set; }

      public List<DistanceLearningSession> Sessions { get; set; }

      public List<DistanceLearningAttendanceRequirement> AttendanceRequirements { get; set; }


   }
}
