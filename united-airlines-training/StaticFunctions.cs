using System;
using System.IO;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace united_airlines_training
{
    /// <summary>
    /// Author: Shawn Pryde
    /// -
    /// Simple static class where you can place general static functions for any class
    /// in the project to use
    /// </summary>
    public static class StaticFunctions
    {
        /// <summary>
        /// Get an SQL connection to the database.
        /// This connection can be used for custom queries
        /// </summary>
        /// <returns></returns>
        public static SqlConnection GetConnection()
        {
            var configuration = GetConfiguration();
            return new SqlConnection(configuration.GetSection("ConnectionStrings").GetSection("ual-database").Value);
        }

        /// <summary>
        /// Get the appsettings configuration
        /// </summary>
        public static IConfigurationRoot GetConfiguration()
        {
            var builder = new ConfigurationBuilder().SetBasePath(Directory.GetCurrentDirectory()).AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            return builder.Build();
        }

        /// <summary>
        /// Displays all errors of an sql exception
        /// to the console
        /// </summary>
        /// <param name="ex"></param>
        public static void DisplaySqlException(SqlException ex)
        {
            for (int i = 0; i < ex.Errors.Count; i++)
            {
                Console.WriteLine($"Index # {i} Error: {ex.Errors[i]}");
            }
        }
    }
}
