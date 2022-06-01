# United Airlines Training Capstone Project

## Setting up Visual Studio 

Working on the Tech Ops Training Content Management system requires Visual Studio 2019 (16.8.1) or higher and requires the following workloads: 

- ASP.NET and web development 
- Azure development 
- Node.js development 
- Data storage and processing 

To ensure that these workloads are installed on your version of visual studio, follow these steps: 

1. Open the Visual Studio Installer 
2. Locate your installation of Visual Studio 
3. Select “More > Modify” 
4. Ensure that each of the above workloads have been checked for you, then select “Modify” at the bottom right 

## Running the Application 
To run the application, you must navigate to the ClientApp folder within the Developer PowerShell (View > Terminal). The first time you run the project locally, you must start by adding the project’s required dependencies using the “npm install” command. Once those are installed, use the “ng build” command to compile the angular portion of the application.  

After angular has finished its build, click the run button in visual studio to run the IIS portion of the application and the page should automatically launch in your default browser.  

To gain access to the site, you need to simulate United’s OAM headers using a Modheader profile. Below is an example Modheader profile with all of the required header values: 

https://bewisse.com/modheader/p/#NobwRAhgNg7hCeBnA8gOzALgGbUQUwBpIAHYvVAEwFkB7CvTHKfIgIwgGMBrAcwCcaAV0oBhGlBp9MYAMQAGAJwAWOQEYAzGCJYAllAAuePokzAAukQAWeCPWOnwHGgFtn5fdK1hyEVlDwUmPp8goRgqBBu0gCCgvqWkjoAXhD6OjToRABu0KHSAEIQiDocAAQUACrRSgByFQCKAExUFcSqVAAiPKo1HQCaAB5gAL4Eji5uqB4YYF4+fgFBIWERUTMDALQcmWA5UHkzI2NgTq7unkTz-oEYwaFEqwzrGxQ7ewezo+NnUxfeEQsbncVpEnmBNoIdIFsrkwYI5AAOACsSgAbKojt9JtNZpcAdclvdwqDpJseDosuQaiSYfswQBxIziQJfE4Tc6HPG+Am3ZYPEnPHSoHRpXBed5ggBSmLZPxxc3xi15RMepI2zihFH81KitI+MtO2L+VyVwP5a3BG0Qb1h0jEUCgQpMrMNHNx-25pr5xItmywggdOoYerB9sdqEQBFKjIEUBZx1dv05HsBhJBvo2eGcxAk8DweAAyvpUoITCGYgb2Un3Sagd7Vc9nBAIjwjOLbYcXVX5VzU8r02CIdAqM2IK2+AAZPCUqDtunSBQKSty42KusqgWWwTQDp4YgQPj6I3lmZUKjLo3J2tp82DjYTucfDoAURqF7dCs964Hau3UDE2bNvA0QUBQfBiPQj5gi+NRnu+1afn2Zo+nef5iIg+giO4bYnmAChIgiS5diuV5rjeKG-tA6GYdhfC7ogHBQTEACSABKIisdEABiFSlC0IilBspQwfBPYpjyyENpaABWNCsBBwa7B2YDonISiiauX7kVJQ5QJKcn0gIgjEExMyNOpxGXjWZH9relF6XJCn0YxuHRFk6TChwiClBUeAcJYnk6M295Cgwlkfr2En1puukdBSOjFBkCmmSpqIaaRWm2RRzx-s+2a5vmhlCCZuFUM+IjpdZmWSTF6oQHoKXjsyAB0TgOk6AACwgigErUuJViFRRuGanPuqDwClACqwqGBQpTRDofDhngzoWGAlhQngAGXshfArcQAASNh2CYGDmEQiAJIeFQiv40gYkQhgDJh4iSNIMhYJ9X1eGk+h3TMBaWBAMCoKUAAKfDwPQ4MCLod1EIIS2sXuUCcFm7ineYwxmEAA 

After accessing the site, your modheader user can be given administrative privileges by changing its RoleCode attribute in the User table of our database. 

 
## Accessing the Database 

There are a few ways to gain access to and make changes within our site’s database, below are the details for the two methods we found most useful: 

1. Access through Visual Studio 

    a. Select “View > SQL Server Object Explorer” 

    b. At the top left of the SQL Server Object Explorer window, there should be a tall rectangle icon with a green plus sign in front of it, click that to add a new SQL server connection 

    - The information required in this window cannot be listed here as it is confidential (you must acquire the information directly from a United Airlines representative/client) 

2. Access through Microsoft SQL Server Management Studio 

    a. After you have opened Microsoft SQL Server Management Studio, if you are not immediately prompted for server credentials, you can input them manually in the Object Explorer (View > Object Explorer)  

    - The information required to connect cannot be listed here as it is confidential (you must acquire the information directly from a United Airlines representative/client) 

Now that you have access to our database, you can create custom SQL queries for it and even manually edit table entries without SQL. 

To manually edit the rows of a table without using an SQL query, navigate to the table you want to edit in the Object Explorer (or SQL Server Object Explorer), right click on it and select “View Data” (in Visual Studio) or “Edit Top 200 rows” in Microsoft SQL Server Management Studio. 
     
Below is a generic query to manually change a user’s role in the database: 

UPDATE [User] SET RoleCode = {your desired role level integer here} WHERE [User].UID LIKE '{your modheader UID}'; 

## Creating a New Database Table 

There are a number of steps required to incorporate a new database table into the project, below is an overview of them all: 

1. Create the table in the database 

    a. This one should be pretty self-explanatory, at this point, you have already connected to the SQL Server, so this is just a matter of running a “CREATE TABLE” query with your desired table attributes 

2. Connect the table in ASP.NET Core 

    a. Create a model for table entries in the Models folder 

    - The data of this model should perfectly match the design of your table columns for your new table 

    b. Add your model to the “tomtcmsContext” file 

    - Create a DbSet for the table similar to what is currently present for every other table


    - Add a modelBuilder.Entity declaration to the ‘OnModelCreating’ creating function like so: 


    c. Create a controller for your new table entity (this will enable a connection between the back-end query results and our front-end through API endpoints) 

    - Within the Controllers folder of the project, create a class using the “API Controller with read/write actions” template 

    - Add a private, readonly attribute of type ‘tomtcmsContext’ 

    - Create a constructor with one parameter of type ‘tomtcmsContext’ 

    - Set the value of your private readonly attribute to the constructor parameter 

    - Update the default CRUD operations to match your new database entity 
 

3. Connect your ASP.NET Core API endpoints to the angular front-end 

    a. Create a typescript interface to match your back-end model 

    - In your Developer PowerShell (from the project’s root directory) navigate to “ClientApp\projects\app\src\app\models” 

    - Run the command “ng g interface {name of your table}”  
    This will create a new interface to represent instances of your table in angular 

    - Open the new interface and add every parameter from your .NET model using TypeScript syntax 

        1. Example: the parameter “public string Name { get; set; }” in C# becomes “name: string” in TypeScript 

        2. IMPORTANT: the name of your typescript parameter must exactly match the spelling and capitalization of its associated parameter in C#, but the first letter in TypeScript should always be lowercase (if this step is missed, angular will not be able to convert your back-end data to an interpretable form in the front-end) 

    b. Create a typescript service to connect to your back-end controller 

    - In your Developer PowerShell (from the project’s root directory) navigate to “ClientApp\projects\app\src\app\services” 

    - Run the command “ng g service {name of your table}” 

        1. Two files will be created: a “.service.ts” file to store your new api endpoints, and a “.service.spec.ts” file to test the “.service.ts” file. 

    - Open the new “{name of your table}.service.ts” file 

    - Add the following imports: 
    import { DatabaseService } from './database.service'; 
    import { NameOfYourTable } from '../models/{ NameOfYourTable }'; 
    import { Observable, throwError } from 'rxjs'; 

    - Make your service extend the ‘DatabaseService’ base service 

    - Add this parameter to your service’s constructor: 
    ‘private _http: HttpClient’ 

    - At this point, you should have everything you need to connect your .NET API endpoints to your angular service. To do so, use the API request URL you specified in your C# controller and the ‘_http’ variable to connect to specific API endpoints. 

        1. All of your back-end function requests will be prefaced by “this._http.get” 
        “this._http.post” 
        “this._http.put” 
        or “this._http.delete” 
        Based on the type of method specified in your controller (i.e. “[HttpGet]”) 

        2. Next, specify your endpoint return type (i.e. “<Movie>”) 

        3. Finally, add your request url (i.e. “this._apiBaseUrl + '/api/Movie/' + {id of movie I want}“) 

## Hosting Static Media Content/Files 

The media files for the site need to be hosted on some kind of file server. OneDrive is what the site was developed with. MSU students get a lot of free OneDrive space if you log in with your MSU email account. One person can host a shared OneDrive folder for media, while the remaining members of the team need to sync up to that OneDrive. It is recommended that the host moves their OneDrive folder that holds all of their shared content to a subfolder in the C: drive. Once everyone’s folders are synced to their respective computers, you will find that you all have different paths/names to your OneDrive folders. The host will likely have the OneDrive stored in the location they chose (C: drive if you followed the recommendation), and the others will have the shared folder somewhere in their documents folder. The Startup.cs file contains all of the logic to find the OneDrive path. Please note that the path in which the OneDrive stores the media is translated by the application to be located at a URL endpoint. This endpoint is “localhost:5000/StaticFiles”. Going to this URL will show you all of the OneDrive media content. While this will work on the team local machines, it will not work on the client side. The client has a remote file share they use for connecting to their Tech Ops media. This file share is secured and requires authentication in order to access. This is why we also incorporated a NetworkConnection class, which allows for connecting to the file share and providing a domain, username, and password. This is all stored in the appsettings variables so that when the build is given to the client, they can provide those credentials accordingly. Below shows the NetworkConnection section in the Startup.cs file

## Deploying Builds to United Airlines Training 

Part of the requirements for this course is being able to provide periodic builds to the client. Since the environments vary greatly between our local machines and their machines, it would need to be provided in a way that enables them to conveniently deploy the application and configure the project settings easily. Here are the steps to follow to send United Airlines Training a fully functional build: 

1. Make sure the PDFJS library folder is stored in the ClientApp/projects/app/src/assets/ directory 

2. Go to appsettings.json and set the “build” variable at the bottom of the json object to true 

3. Navigate to home.component.ts file and make sure the PDFPath variable is pointing at /assets/pdfjs/...

4. Repeat step 3 for the search.component.ts and media-page.component.ts files 

5. Run “ng build” in the ClientApp directory 

6. Confirm that the wwwroot folder has the assets/pdfjs folder. If it does not, then please copy the folder from the location in step 1 and paste it inside the assets folder. 

7. Go to the root “united-airlines-training" directory and right click on the directory. Click “Publish”.

8. On the publish page, click “New”. A new pop up window should appear. Click “Folder” as the target location and click the “Next” button. 

9. Choose a publish location that you can easily find the build and click “Finish”.

10. Click “Publish” and wait for the build to complete 

11. Go to folder location and zip the folder contents 

12. Upload the build to United’s SharePoint or where they request you to upload builds at 

13. Email the client letting them know a build has been made 

## EBUSY Errors Related to Assets/PDFjs 

One annoying issue that may come up has to do with the assets folder in wwwroot/assets preventing you from running “ng build” by saying “EBUSY: Resource Busy or Locked”. For some reason, even after closing the app, it pdfjs does not close down. A fix is not currently known at this time (one could potentially fix this issue by figuring out an alternative means of integrating pdfjs that does not use the assets folder). There are two known workarounds to deal with this issue though: 

 

1. Delete the pdfjs folder from wwwroot/assets (or clear the entire assets folder) every time you get the issue. This should allow “ng build” to run correctly. However, the process of deleting the folder every time is tedious and time consuming. 

2. (RECOMMENDED, for now) Move a copy of the pdfjs folder to your OneDrive file share where you are hosting the media. Comment out (DO NOT DELETE) the lines which reference pdfjs in the assets folder (the lines exist in the media page, home page, media pop up page, and search results page), and instead have the application point to the pdfjs folder stored on your OneDrive file share. This will allow you to build as many times as you want while never coming across the EBUSY error. However, when building the application for your sponsors, you will need to uncomment the lines referencing the assets folder and comment out your lines referencing the pdfjs in the OneDrive. It’s annoying, but is the more manageable way of dealing with the EBUSY error. 


## Using the Media Upload Page 

As of writing, all the entry fields on the page use text to describe the files. You will need to enter the file path for the media item by hand, the thumbnail path by hand, etc. Like everything else on the site, these files paths must be referenced relative to the OneDrive folder hosting the static files. Ex: /StaticFiles/Example_Media/IDG_Oil_Check.mp4 

For an uploaded media item to have a list of media related to it shown on the media page, you must enter in some keywords for the media item on the upload page. Related media will be shown based on which keywords the two items have in common. 
