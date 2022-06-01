using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace united_airlines_training.Models
{
    public class ImportForm
    {
        public IFormFile File { get; set; }
    }
}
