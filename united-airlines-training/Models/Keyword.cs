using System;
using System.Data.SqlClient;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Shawn Pryde
    /// </summary>
    public class Keyword
    {
        private string _word;
        public int ID { get; set; }
        public string Word 
        { 
            get => _word;
            set
            {
                _word = value ?? throw new ArgumentNullException();
            } 
        }

        /// <summary>
        /// Parses an sql data reader for Keyword attributes,
        /// then creates a Keyword object from those attributes
        /// </summary>
        /// <param name="reader"></param>
        /// <returns></returns>
        public static Keyword SQLToKeyword(SqlDataReader reader)
        {
            Keyword newKeyword = new Keyword();
            foreach (var prop in newKeyword.GetType().GetProperties())
            {
                newKeyword.GetType().GetProperty(prop.Name).SetValue(newKeyword, reader[prop.Name] == DBNull.Value ? null : reader[prop.Name], null);
            }
            return newKeyword;
        }

        #region Operator Overloads
        public static bool operator ==(Keyword k1, Keyword k2)
        {
            return k1.ID == k2.ID;
        }
        public static bool operator !=(Keyword k1, Keyword k2)
        {
            return k1.ID != k2.ID;
        }

        public override int GetHashCode()
        {
            return base.GetHashCode();
        }
        #endregion
    }
}
