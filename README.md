# Final Assignment Brands - Akshat Jain

Author : Akshat Jain

Date Of Submission : 11-October-2019

Architecture : MVC(Express + NodeJS + Redis + MySQL )

The project contains all the required API&#39;s for CRUD operations for the BAND Management System.

All Settings related project can be modified in `app.js` file

To Install and Run the Project Kindly follow the instructions listed below :

- Run **npm install** in the working directory to restore the dependencies
- Change the Database, Redis, Port **configurations** in the app.js file
- Now run **npm start** to start the server

**\*\* All The Tables will be created automatically so no manual interaction will be required with the database, Only the database instance needs to be created \*\***

URL&#39;s For API&#39;s are:

**Create Band** : /api/createband/

**Update Band** : /api/updateband/:bandID

**Get Bands** : /api/band/ , /api/band/:bandID {For Single Band}

**Delete Band** : /api/deleteband/:bandID

All the above API&#39;s are fully secured by the JWT(Json Web Token&#39;s) i.e. the **Authorization Header**

**Session persistent state is maintained by the Redis Server**

Postman API&#39;s list:
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Postman%20API's.png)


Other then that Login, Registration, Dashboard is powered by the EJS(Embedded JavaScript) that uses express-session, Redis to maintain the Session for the User that Login&#39;s in his account.

The Dashboard looks like :

Login Screen :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Login%20Screen.png)
Register User :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Register%20User.png)
Forgotten Password :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Forgotten-password.png)
Password Recovery Mail :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/recover-mail.png)
Main Dashboard :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/dashboard.png)
Create Band:
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Create%20Band.png)
Update Existing Band :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Update%20Band.png)
Delete Existing Band :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Delete%20Band.png)
My Profile :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/my-profile.png)


**After Starting the Project From the Terminal it Will :**

Server Start Terminal will give Output like :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Run%20Project.png)
Redis Server Output/Monitoring will Give :
![alt text](https://raw.githubusercontent.com/akshatjain244/NodeJS-Final-Assignment/master/screenshots/Redis%20Server.png)
All the API&#39;s communicates with the Frontend using the AJAX (jQuery)
