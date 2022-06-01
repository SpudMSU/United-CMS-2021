using Microsoft.Data.SqlClient;
using SQLitePCL;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using united_airlines_training.Controllers;
using united_airlines_training.Models;
using Xunit;

namespace united_airlines_training_test.Controllers
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// Abstract class used to outline other classes which 
    /// test a local database via a TestDatabaseContext
    /// </summary>
    public abstract class AbstractDatabaseTester : IDisposable
    {

        // database reference
        protected TestDatabaseContext _testDatabaseContext;
        #region Fake data for database population
        // time constants
        protected DateTime _declerationOfIndependence;
        protected DateTime _tenYearsAfterDec;
        protected List<User> _testUsers = new List<User>
        {
            new User
            {
                //UserId = 1,
                Email = "myguy@hotmail.com",
            },
            new User
            {
                //UserId = 2,
                Email = "JaneDoe@nomail.com",
            }
        };
        private bool _testUsersHaveBeenAdded = false;
        protected List<MediaItem> _testMedia = new List<MediaItem>
        {
        };
        private bool _testMediaHasBeenAdded = false;
        private List<MediaType> _testTypes = new List<MediaType>
        {
            new MediaType
            {
                //Id = 1,
                Name = "mp4",
                Icon = "/nonexistentpath1"
            }
        };
        private bool _testTypesHaveBeenAdded = false;
        #endregion

        protected AbstractDatabaseTester()
        {
            // establish times
            _declerationOfIndependence = new DateTime(1776, 7, 4, 13, 34, 26);
            _tenYearsAfterDec = _declerationOfIndependence.AddYears(10);

            // establish times
            foreach (User u in _testUsers)
            {
                u.CreatedAt = _declerationOfIndependence;
            }
            foreach (MediaItem m in _testMedia)
            {
                m.CreatedAt = _declerationOfIndependence;
            }
        }

        /// <summary>
        /// Adds all test users to the test database
        /// (If not already added)
        /// </summary>
        protected void AddAllTestUsers()
        {
            if (!_testUsersHaveBeenAdded)
            {
                _testDatabaseContext.User.AddRange(_testUsers);
                _testUsersHaveBeenAdded = true;
                _testDatabaseContext.SaveChanges();
            }
        }
        /// <summary>
        /// Adds all test Media to the test database
        /// (If not already added)
        /// </summary>
        protected void AddAllTestMedia()
        {
            if (!_testMediaHasBeenAdded)
            {
                _testDatabaseContext.Media.AddRange(_testMedia);
                _testMediaHasBeenAdded = true;
                _testDatabaseContext.SaveChanges();
            }
        }
        /// <summary>
        /// Adds all test MediaTypes to the test database
        /// (If not already added)
        /// </summary>
        protected void AddAllTestMediaTypes()
        {
            if (!_testTypesHaveBeenAdded)
            {
                _testDatabaseContext.MediaType.AddRange(_testTypes);
                _testTypesHaveBeenAdded = true;
                _testDatabaseContext.SaveChanges();
            }
        }

        /// <summary>
        /// Acts like a destructor, but called for every test
        /// </summary>
        public void Dispose()
        {
            //_testDatabaseContext.Database.EnsureDeleted();
            //_testDatabaseContext.Dispose();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="createIt"></param>
        protected void SetDatabaseStatus(bool createIt)
        {
            try
            {
                if (createIt)
                {
                    // create dummy test database
                    _testDatabaseContext = new TestDatabaseContext();
                    _testDatabaseContext.Database.EnsureCreated();
                }
                else
                {
                    _testDatabaseContext.Database.EnsureDeleted();
                    _testDatabaseContext.Dispose();
                    _testDatabaseContext = null;
                }
            }
            catch (Exception exc)
            {
                Debug.Print("*****\n" + exc.Message + "\n*****");
            }
        }

        /// <summary>
        /// Destructor (or finalizer)
        /// </summary>
        //~AbstractDatabaseTester()
        //{
        //    _testDatabaseContext.Database.EnsureDeleted();
        //    _testDatabaseContext.Dispose();
        //}
    }
}
