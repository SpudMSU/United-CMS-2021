using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using united_airlines_training.Models;

namespace united_airlines_training_test
{
    /// <summary>
    /// Author: Shawn
    /// -
    /// Context for creating and interfacing with a local database
    /// used for testing purposes
    /// </summary>
    public class TestDatabaseContext : tomtcmsContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // override server connection to be local
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=united_airlines_training_test;Trusted_Connection=True;MultipleActiveResultSets=true");
        }

        // all entity creation is taken care of in the base class
    }
}
