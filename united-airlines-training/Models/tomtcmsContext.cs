using Microsoft.EntityFrameworkCore;

namespace united_airlines_training.Models
{
    /// <summary>
    /// Author: Chris Nosowsky / Shawn Pryde
    /// <br></br>
    /// Database context class for defining each database entities properties
    /// </summary>
    public partial class tomtcmsContext : DbContext
    {
        /// <summary>
        /// Default constructor
        /// </summary>
        public tomtcmsContext()
        {
        }

        public tomtcmsContext(DbContextOptions<tomtcmsContext> options)
            : base(options)
        {
        }

        // Entities defined below for all tables that hold entity framework properties
        public virtual DbSet<GeneralFeedback> GeneralFeedback { get; set; }
        public virtual DbSet<MediaFeedback> MediaFeedback { get; set; }
        public virtual DbSet<MediaType> MediaType { get; set; }
        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<UserHistory> UserHistory { get; set; }
        public virtual DbSet<MediaItem> Media { get; set; }
        public virtual DbSet<Channel> Channel { get; set; }
        public virtual DbSet<Rating> Rating { get; set; }
        public virtual DbSet<Comment> Comment { get; set; }
        public virtual DbSet<NestedChannel> NestedChannel { get; set; }
        public virtual DbSet<Keyword> Keyword { get; set; }
        public virtual DbSet<Role> Role { get; set; }
        public virtual DbSet<AdminAuditLog> AdminAuditLog { get; set; }

        public virtual DbSet<ChangedChannel> ChangedChannel { get; set; }

        public virtual DbSet<ChangedMedia> ChangedMedia { get; set; }

        public virtual DbSet<ChangedUser> ChangedUser { get; set; }

        public virtual DbSet<ChangedComment> ChangedComment { get; set; }
        
        public virtual DbSet<ThreadedComment> ThreadedComment { get; set; }

        public virtual DbSet<CommentReasonForRejection> CommentReasonForRejection { get; set; }

      public virtual DbSet<DistanceLearningMedia> DistanceLearningMedia { get; set; }

      public virtual DbSet<DistanceLearningAttendanceRequirement> DistanceLearningAttendanceRequirement { get; set; }


      #region DbSets that do not have exclusive controllers
      public virtual DbSet<MediaToChannel> MediaToChannel { get; set; }
        public virtual DbSet<MediaKeyword> MediaKeyword { get; set; }
        public virtual DbSet<ChannelKeyword> ChannelKeyword { get; set; }
        public virtual DbSet<DistanceLearningSession> DistanceLearningSession { get; set; }
      #endregion

      /// <summary>
      /// Establishes the model for which our connected database
      /// must follow (the model describes the database' tables as
      /// well as each table's structure)
      /// </summary>
      /// <param name="modelBuilder"></param>
      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {

         modelBuilder.Entity<GeneralFeedback>(entity =>
         {
            entity.Property(e => e.GeneralFeedbackId).HasColumnName("GeneralFeedbackID");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.Property(e => e.UID)
                   .HasMaxLength(7);

            entity.Property(e => e.Description)
                   .IsRequired()
                   .HasMaxLength(255)
                   .IsUnicode(false);
         });

         modelBuilder.Entity<MediaFeedback>(entity =>
         {
            entity.HasKey(e => new { e.MediaFeedbackID })
                   .HasName("PK__MediaFee__FCA4E7F60483DCCF");

            entity.Property(e => e.MediaFeedbackID).HasColumnName("MediaFeedbackID");

            entity.Property(e => e.MediaId).HasColumnName("MediaID");

            entity.Property(e => e.UID)
                   .HasMaxLength(7);

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.Property(e => e.Description)
                   .IsRequired()
                   .HasMaxLength(255)
                   .IsUnicode(false);
         });

         modelBuilder.Entity<MediaType>(entity =>
         {
            entity.HasKey(e => e.Id).HasName("ID");

            entity.Property(e => e.Icon)
                   .IsRequired()
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.Name)
                   .IsRequired()
                   .HasMaxLength(100)
                   .IsUnicode(false);
         });


         modelBuilder.Entity<UserHistory>(entity =>
         {
            entity.HasKey(e => new { e.UID, e.MediaID })
                   .HasName("PK__UserHist__FCA4E7F61F3EBD54");

            entity.Property(e => e.UID).HasColumnName("UID");

            entity.Property(e => e.MediaID).HasColumnName("MediaID");

            entity.Property(e => e.ClickedAmount).HasColumnName("ClickedAmount");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

         });

         #region Media Items
         //
         // Base media item
         //
         modelBuilder.Entity<MediaItem>(entity =>
         {
            entity.HasKey(e => e.MediaID);
            entity.Property(e => e.Title)
                   .IsRequired()
                   .IsUnicode(false);
            entity.Property(e => e.Description)
                   .IsUnicode(true);
            entity.Property(e => e.ThumbnailPath)
                   .HasColumnName("ThumbnailPath");
            entity.Property(e => e.Path)
                   .IsRequired()
                   .HasColumnName("Path");
            entity.Property(e => e.FlaggedAllUsers)
                   .HasColumnName("FlaggedAllUsers");
            entity.Property(e => e.FlaggedDepartments)
                   .HasColumnName("FlaggedDepartments");
            entity.Property(e => e.FlaggedJobCodes)
                   .HasColumnName("FlaggedJobCodes");
            entity.Property(e => e.FlaggedLocations)
                   .HasColumnName("FlaggedLocations");
            entity.Property(e => e.FlaggedJobGroups)
                   .HasColumnName("FlaggedJobGroups");
            entity.Property(e => e.FlaggedCostCenters)
                   .HasColumnName("FlaggedCostCenters");
            entity.Property(e => e.CreatedAt);
            entity.Property(e => e.CommentingEnabled)
                  .HasColumnName("commentingEnabled");
         });
         #endregion

         modelBuilder.Entity<Channel>(entity =>
         {
            entity.HasKey(e => e.ChannelID);

            entity.Property(e => e.Title)
                   .IsRequired();
            entity.Property(e => e.Description).HasColumnName("Description");
            entity.Property(e => e.Icon).HasColumnName("Icon");
         });

         modelBuilder.Entity<User>(entity =>
         {
            entity.HasKey(e => e.UID)
                   .HasName("PK__User__1788CCAC22C7AE23");

            entity.Property(e => e.UID)
                   .HasColumnName("UID")
                   .HasMaxLength(7)
                   .IsUnicode(false);

            entity.Property(e => e.Company)
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.Property(e => e.Department)
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.Email)
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.EmploymentStatus)
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.FirstName)
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.LastName)
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.LocationCode)
                   .HasMaxLength(50)
                   .IsUnicode(false);

            entity.Property(e => e.OccupationTitle)
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.CostCenter)
                   .HasMaxLength(50)
                   .IsUnicode(false);

            entity.Property(e => e.CostCenterDesc)
                   .HasMaxLength(50)
                   .IsUnicode(false);

            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
         });

         modelBuilder.Entity<MediaToChannel>(entity =>
         {
            entity.HasKey(e => new { e.MediaID, e.ChannelID });

            entity.Property(e => e.MediaID)
                   .IsRequired();
            entity.Property(e => e.ChannelID)
                   .IsRequired();
         });

         modelBuilder.Entity<NestedChannel>(entity =>
         {
            entity.HasKey(e => new { e.ParentId, e.ChildId })
                   .HasName("PK__NestedCh__A8D6F17C7BBAC21B");

            entity.Property(e => e.ParentId).HasColumnName("ParentID");

            entity.Property(e => e.ChildId).HasColumnName("ChildID");
         });

         modelBuilder.Entity<Rating>(entity =>
         {
            entity.HasKey(e => new { e.UID, e.MediaID })
                   .HasName("PK__Rating__FCA4E7F6C558E1B4");

            entity.Property(e => e.UID)
                   .HasColumnName("UID")
                   .HasMaxLength(7)
                   .IsUnicode(false);

            entity.Property(e => e.MediaID).HasColumnName("MediaID");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
         });

         modelBuilder.Entity<Comment>(entity =>
         {
            entity.HasKey(e => new { e.UID, e.MediaID, e.CommentID })
                   .HasName("PK__Comment__FCA4E7F6F894AAE7");

            entity.Property(e => e.UID)
                   .HasColumnName("UID")
                   .HasMaxLength(7)
                   .IsUnicode(false);

            entity.Property(e => e.MediaID).HasColumnName("MediaID");

            entity.Property(e => e.CommentID).HasColumnName("CommentID");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.Property(e => e.Description)
                   .IsRequired()
                   .HasMaxLength(255)
                   .IsUnicode(false);

            entity.Property(e => e.Queued);
         });

         modelBuilder.Entity<ChangedComment>(entity =>
         {
            entity.HasKey(e => e.ChangeID);

            entity.Property(e => e.UID)
                   .HasColumnName("UID");

            entity.Property(e => e.MediaID)
                   .HasColumnName("MediaID");

            entity.Property(e => e.CommentID)
                   .HasColumnName("CommentID");

            entity.Property(e => e.Description)
                   .HasColumnName("Description");

            entity.Property(e => e.Queued);

            entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasColumnName("CreatedAt");

                entity.Property(e => e.ParentId)
                    .HasColumnName("ParentId");

            });
            modelBuilder.Entity<ChangedMedia>(entity =>
            {
                entity.HasKey(e => e.ChangeID);
                entity.Property(e => e.MediaID)
                    .HasColumnName("MediaID");
                entity.Property(e => e.MediaStatus)
                    .HasColumnName("MediaStatus");
                entity.Property(e => e.Title)
                    .HasColumnName("Title");
                entity.Property(e => e.Description)
                    .HasColumnName("Description");
                entity.Property(e => e.ThumbnailPath)
                    .HasColumnName("ThumbnailPath");
                entity.Property(e => e.MediaTypeID)
                    .HasColumnName("MediaTypeID");
                entity.Property(e => e.Path)
                    .HasColumnName("Path");
                entity.Property(e => e.FlaggedAllUsers)
                    .HasColumnName("FlaggedAllUsers");
                entity.Property(e => e.FlaggedLocations)
                    .HasColumnName("FlaggedLocations");
                entity.Property(e => e.FlaggedJobCodes)
                    .HasColumnName("FlaggedJobCodes");
                entity.Property(e => e.FlaggedDepartments)
                    .HasColumnName("FlaggedDepartments");
                entity.Property(e => e.FlaggedJobGroups)
                    .HasColumnName("FlaggedJobGroups");
                entity.Property(e => e.FlaggedCostCenters)
                    .HasColumnName("FlaggedCostCenters");
                entity.Property(e => e.CreatedAt)
                    .HasColumnName("CreatedAt").HasColumnType("datetime");
            });

         modelBuilder.Entity<ChangedChannel>(entity =>
         {
            entity.HasKey(e => e.ChangeID);
            entity.Property(e => e.ChannelID).HasColumnName("ChannelID");
            entity.Property(e => e.Title).HasColumnName("Title");
            entity.Property(e => e.Description).HasColumnName("Description");
            entity.Property(e => e.Icon).HasColumnName("Icon");
            entity.Property(e => e.ModifiedID).HasColumnName("ModifiedID");
         });

         modelBuilder.Entity<ChangedUser>(entity =>
         {
            entity.HasKey(e => e.ChangeID);

            entity.Property(e => e.UID)
                   .HasColumnName("UID");

            entity.Property(e => e.FirstName).HasColumnName("FirstName");

            entity.Property(e => e.LastName).HasColumnName("LastName");

            entity.Property(e => e.Email).HasColumnName("Email");

            entity.Property(e => e.EmploymentStatus).HasColumnName("EmploymentStatus");

            entity.Property(e => e.Company).HasColumnName("Company");

            entity.Property(e => e.RoleCode).HasColumnName("RoleCode");

            entity.Property(e => e.JobRoleCode).HasColumnName("JobRoleCode");

            entity.Property(e => e.JobGroup).HasColumnName("JobGroup");

            entity.Property(e => e.OccupationTitle).HasColumnName("OccupationTitle");

            entity.Property(e => e.Department).HasColumnName("Department");


            entity.Property(e => e.LocationCode).HasColumnName("LocationCode");

            entity.Property(e => e.CostCenter).HasColumnName("CostCenter");

            entity.Property(e => e.CostCenterDesc).HasColumnName("CostCenterDesc");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

         });

         modelBuilder.Entity<Keyword>(entity =>
         {
            entity.HasKey(e => e.ID).HasName("ID");

            entity.Property(e => e.Word);
         });

         modelBuilder.Entity<MediaKeyword>(entity =>
         {
            entity.HasKey(e => new { e.KeywordID, e.MediaID });

            entity.Property(e => e.MediaID);
            entity.Property(e => e.KeywordID);
         });

         modelBuilder.Entity<ChannelKeyword>(entity =>
         {
            entity.HasKey(e => new { e.KeywordID, e.ChannelID });

            entity.Property(e => e.ChannelID);
            entity.Property(e => e.KeywordID);
         });

         modelBuilder.Entity<DistanceLearningSession>(entity =>
         {
            entity.HasKey(e => e.ID);

            entity.Property(e => e.UrlPath)
                   .IsUnicode(false)
                   .IsRequired()
                   .HasColumnName("URLPath");
            entity.Property(e => e.StartTime)
                   .IsRequired()
                   .HasColumnName("Start Time");
            entity.Property(e => e.EndTime)
                   .IsRequired()
                   .HasColumnName("End Time");
            entity.Property(e => e.MediaID)
                   .IsRequired();
            entity.Property(e => e.IsPasswordProtected)
               .HasColumnName("IsPasswordProtected");
            entity.Property(e => e.Password)
               .HasColumnName("Password");
         });
         modelBuilder.Entity<DistanceLearningMedia>(entity =>
         {
            entity.HasKey(e => e.MediaId);
            entity.Property(e => e.Instructions);
            entity.Ignore(e => e.Sessions);
            entity.Ignore(e => e.AttendanceRequirements);
         });

         modelBuilder.Entity<DistanceLearningAttendanceRequirement>(entity =>
         {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MediaId);
            entity.Property(e => e.Description);
         });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.Property(e => e.RoleID)
                    .HasColumnName("RoleID")
                    .ValueGeneratedNever();

                entity.Property(e => e.RoleLevel)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<AdminAuditLog>(entity =>
              {
                  entity.HasKey(e => e.ID);
                  entity.Property(e => e.Category)
                      .HasColumnName("Category").IsRequired();
                  entity.Property(e => e.Item)
                      .HasColumnName("Item").IsRequired();
                  entity.Property(e => e.Change)
                      .HasColumnName("Change").IsRequired();
                  entity.Property(e => e.Username)
                      .HasColumnName("Username").IsRequired();
                  entity.Property(e => e.UserRole)
                      .HasColumnName("UserRole").IsRequired();
                  entity.Property(e => e.ChangeDate)
                      .HasColumnName("ChangeDate")
                          .IsRequired().HasColumnType("datetime");
                  entity.Property(e => e.MediaID)
                      .HasColumnName("MediaID");
                  entity.Property(e => e.Reverted)
                      .HasColumnName("Reverted");
              });
              modelBuilder.Entity<ThreadedComment>(entity =>
              {
                 entity.HasKey(e => new { e.ParentID, e.ChildID })
                     .HasName("PK__ThreadedComment__A8D6F17C7BBAC21B");
              
                 entity.Property(e => e.ParentID).HasColumnName("ParentID").IsRequired();
              
                 entity.Property(e => e.ChildID).HasColumnName("ChildID").IsRequired();
                 entity.Property(e => e.MediaID).HasColumnName("MediaID").IsRequired();
              });

               modelBuilder.Entity<CommentReasonForRejection>(entity =>
               {
                  entity.Property(e => e.ID)
                      .HasColumnName("Id")
                      .ValueGeneratedNever();

                  entity.Property(e => e.Reason)
                      .HasColumnName("Reason")
                      .IsUnicode(false);
               });

         // end with this line
         OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
