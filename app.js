/**
 * @author : akshatjain
 * 
 * Created At : 05-October-2019
 * Last Modified At : 10-October-2019
 * 
 * See Documentation : @github
 * URL
 * Architecture : MVC
 * Description : This is the major Configuration file 
 *               all the configurations related this app
 *               is in this file edit it carefully.
 */

var express = require("express")
var path = require("path")
var bodyParser = require("body-parser")
var session = require("express-session")
var cookieParser = require('cookie-parser')
var DB = require("./Services/sequelize-service")
const nodemailer = require('nodemailer');

//Enable Redis Support For Session Storage
const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);

var app = express()

//Set DataBase Configuration...
const dbConfig = {
    dbName: 'bands',
    dbUsername: 'root',
    dbPassword: 'root',
    internal: {
        dialect: 'mysql',
        url: 'localhost',
        port: 3306
    }
}

//App Session Configuration...
app.use(
    session({
        // Usses the Redis Server To Save the Sessions
        secret: "NodeJs Express Is Best in Web Development",
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false
        },
        store: new redisStore({
            host: dbConfig.internal.url,
            port: 6379,
            client: redisClient,
            ttl: 86400
        })
    })
)

//SMTP Email Configuration... {Kindly Enable Less Secure App Access Of Your Account}
var smtpMailConfig = {
    service: 'gmail',
    auth: {
        user: 'xxxxxxxxxxxxx@gmail.com', // Email id
        pass: 'xxxxxxxxxxxxx' // Password
    }
}

//Enable Server Side Cookies Editing...
app.use(cookieParser())

//Set the EJS support...
app.set('view engine', 'ejs');
//Set custom views path although it is default views directory...
app.set('views', path.join(__dirname, '/Views'))

//Allow the static CSS,JS,IMGS files to the MVC Server...
app.use(express.static(__dirname + '/Assets'))

//Enable JSON/URL Parsing Support...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

//Project Port:
const port = 3000

// Sequelize Service Init...
DB.connectToDB(dbConfig).then((dataSets) => {
        console.log(`Database Synced And is Connected!`)
        //Hit API URL's Only When The the DataBase is Connected...
        enableAPI(dataSets.Band)
        enableFE(dataSets.User)
        enable404()
    })
    .catch((err) => console.log(err))

//Enable Band API with DataSets...
function enableAPI(BandsDataSet) {
    //Enable API Support for CRUD Operations...
    const bandApi = require("./Controllers/band-api")
    bandApi.setDataset(BandsDataSet, (router) => {
        app.use('/api', router)
    })
}

//Enable User FrontEnd UI from DataSets...
function enableFE(UserDataSet) {
    const transporter = nodemailer.createTransport(smtpMailConfig)
    //Enable Front-End Executin for the User Interface:
    const userUI = require("./Controllers/user-FE")
    userUI.setDataSet(UserDataSet, transporter, router => {
        app.use('/', router)
    })
}

//Enable 404 Page after everything get done...
function enable404() {
    //Custom 404 if Some One get losts:
    var notFound = require('./Controllers/404')
    app.use(notFound.router)
}

//Start Server at last
app.listen(port, (err) => {
    if (err) console.log(`${port} is already in use !!!`)
    console.log(`Listening Server on ${port}`)
})