using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using united_airlines_training.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.IO;
using united_airlines_training.Middleware;
using System.Net;
using Microsoft.AspNetCore.StaticFiles;

namespace united_airlines_training
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();
            services.AddDbContext<tomtcmsContext>(options => options.UseSqlServer(Configuration.GetConnectionString("ual-database")));
            services.AddCors();
            services.AddMvc();
            services.AddDirectoryBrowser();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseMiddleware<OAMMiddleware>();
            var provider = new FileExtensionContentTypeProvider();
            provider.Mappings[".properties"] = "application/octet-stream";
            app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = provider,
            });


            // Determines if the appsetting value is set to build. We did this since our dev environment didn't have a fileshare. 
            // We used one drive instead
            if (Configuration.GetValue<bool>("build"))
            {
                //PRODUCTION! This connects to the file share using the appsetting credentials (client will configure the appsettings)
                NetworkCredential sourceCredentials = new NetworkCredential
                {
                    Domain = Configuration.GetValue<string>("FileServer:domain").ToString(),
                    UserName = Configuration.GetValue<string>("FileServer:username").ToString(),
                    Password = Configuration.GetValue<string>("FileServer:password").ToString(),
                };
                NetworkConnection NC = new NetworkConnection(Configuration.GetValue<string>("FileServer:folderPath"), sourceCredentials);
                Console.WriteLine("File server connected.");
                app.UseFileServer(new FileServerOptions
                {
                    FileProvider = new PhysicalFileProvider(Path.Combine(Configuration.GetValue<string>("FileServer:folderPath"))),
                    RequestPath = "/StaticFiles",
                    EnableDirectoryBrowsing = true,
                });
            } 
            else {
                string path = "";
                bool foundPath = false;
                string folderPath = @Configuration.GetValue<string>("TestFolder");
                // For the team member who created the OneDrive folder
                if (Directory.Exists("C:\\drive\\Media"))
                {
                    Console.WriteLine("FOUND ONEDRIVE MEDIA");
                    path = "C:\\drive\\Media";
                    foundPath = true;
                }
                // For the team members who didn't create the one drive folder. Customize for your team. We named our OneDrive folder Media
                else if (Directory.Exists(folderPath))
                {
                    Console.WriteLine("FOUND MICHIGAN STATE UNIVERSITY SHARED MEDIA");
                    path = folderPath;
                    Console.WriteLine("Path: " + path);
                    foundPath = true;
                }
                // For the team members who didn't create the one drive folder. Customize for your team. We named our OneDrive folder Media
                //else if (Directory.Exists(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile) + @"\Michigan State University\Walsh, Brendan Daniel - Media"))
                //{
                //    Console.WriteLine("FOUND MICHIGAN STATE UNIVERSITY SHARED MEDIA");
                //    path = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile) + @"\Michigan State University\Walsh, Brendan Daniel - Media";
                //    foundPath = true;
                //}
                else
                {
                    Console.WriteLine("ERROR. CANNOT FIND SHARED MEDIA FOLDER.");
                }
                if (foundPath)
                {
                    // DEVELOPMENT!!!
                    app.UseFileServer(new FileServerOptions
                    {
                        FileProvider = new PhysicalFileProvider(path),
                        RequestPath = "/StaticFiles",
                        EnableDirectoryBrowsing = true
                    });
                }
            }

            app.UseRouting();
            app.UseAuthorization();
            app.UseCors(
                options => options.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
            );

            app.UseEndpoints(endpoints =>
            {
              endpoints.MapControllerRoute(
                  name: "default",
                  pattern: "{controller=Home}/{action=Index}/{id?}");
            });

        }
    }
}
