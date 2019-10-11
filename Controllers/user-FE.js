/**
 * @author : akshatjain
 */
var express = require("express")
var userService = require("../Services/user-service")
var encryption = require("../Services/encryption")
var userFEService = require("../Services/user-fe-service")

var router = express.Router()

let {
    getEncodedUser,
    getDecodedUser
} = encryption


const {
    processPasswordChangeRequest,
    sendResetMail,
    signInUser,
    signupUser
} = userFEService

const loggedInOnly = (failure = "/login") => (req, res, next) => {
    if (req.session.user)
        next()
    else
        res.redirect(failure)
}

// router.use(loggedInOnly())

router.get("/", loggedInOnly(), (req, res) => {
    res.redirect("/dashboard")
})

//Login/Registration Static Pages...
router.get('/login', (req, res) => {
    if (req.session.user)
        res.redirect("/dashboard")
    else
        res.render('login', {
            error: ""
        })
})
router.get('/register', (req, res) => {
    if (req.session.user)
        res.redirect("/dashboard")
    else
        res.render('register', {
            error: ""
        })
})

//Logout 
router.get('/logout', (req, res) => {
    req.session.user = null
    res.clearCookie('username_jwt')
    res.redirect("/login")
})

//Reset Password

//User Dashboard...
router.get('/dashboard', loggedInOnly(), (req, res) => {
    username = req.session.user.username
    name = req.session.user.name
    res.cookie('username_jwt', getEncodedUser(username))
    res.render('dashboard', {
        username: name
    })
})

function datasetAPIs(UserDataSet) {
    //Login User Post Method...
    router.post('/login', (req, res) => {
        let {
            username,
            password,
        } = req.body

        validateLength(username, 'Username Cannot Be Blank', 'login', res)
        validateLength(password, 'Password Cannot Be Blank', 'login', res)

        signInUser(UserDataSet, username, password)
            .then(resp => {
                req.session.user = {
                    username: resp.username,
                    name: resp.name
                }
                res.redirect("/")
            })
            .catch(err => renderError(res, err.error, err.msg))
    })

    //Register/Signup User...
    router.post('/register', (req, res) => {
        let {
            username,
            name,
            password,
            cpassword,
            DateOfBirth,
            collegeCompany
        } = req.body

        validateLength(username, 'Username Cannot Be Blank', 'register', res)
        validateLength(name, 'Name Cannot Be Blank', 'register', res)
        validateLength(password, 'Password Cannot Be Blank', 'register', res)
        validateLength(DateOfBirth, 'Date Of Birth Cannot Be Blank', 'register', res)

        if (password !== cpassword) {
            renderError(res, 'register', 'Passwords Does Not Matched With Each Other')
        }

        let user = {
            username,
            name,
            password,
            DateOfBirth,
            collegeCompany
        }
        signupUser(UserDataSet, user)
            .then(resp => {
                req.session.user = {
                    username: resp.username,
                    name: resp.name
                }
                res.redirect("/")
            })
            .catch(err => renderError(res, err.error, err.msg))
    })

    //Get User Profile...
    //User Profile...
    router.get('/my-profile', loggedInOnly(), (req, res) => {
        username = req.session.user.username
        name = req.session.user.name
        userService.getUser(UserDataSet, username, user => {
            res.render('my-profile', {
                username: name,
                user: user
            })
        })
    })

    //Get Method of Reset User Password
    router.get('/reset', (req, res) => {
        var secret = req.query.secret
        let user = getUserFromSecret(UserDataSet, secret)
        user.then(username => renderResetUI(username, '', secret, res))
            .catch(error => res.redirect('/'))
    })

    //Post Method of Reset User Password
    router.post('/reset', (req, res) => {
        let {
            secret,
            password,
            cpassword,
        } = req.body

        let user = getUserFromSecret(UserDataSet, secret)
        user.then(username => {
                //Process Password Reset...
                processPasswordChangeRequest(UserDataSet, username, password, cpassword, secret)
                    .then(resp => renderError(res, resp.success, resp.msg))
                    .catch(err => renderResetUI(err.username, err.msg, err.secret, res))
            })
            .catch(error => res.redirect('/'))

    })
}

//ForgottenPasssword Mail Reset Mailer...
function forgottenPasswordController(UserDataSet, transporter) {
    router.post('/reset-password', (req, res) => {
        let resetEmail = req.body.email
        if (resetEmail.trim().length <= 0) {
            res.redirect('/')
        } else {
            sendResetMail(transporter, UserDataSet, req.headers.host, resetEmail)
                .then(resp => renderError(res, resp.success, resp.msg))
                .catch(err => renderError(res, err.error, err.msg))
        }
    })
}

function renderResetUI(username, error, secret, res) {
    res.render('reset', {
        username: username,
        error: error,
        secret: secret
    })
}

function getUserFromSecret(User, secret) {
    return new Promise((resolve, error) => {
        let username = getDecodedUser(secret)
        if (secret.trim().length <= 0) {
            error('Null Secret')
        } else {
            userService.getUser(User, username, user => {
                if (user.msg) {
                    error('No User Found')
                } else {
                    resolve(username)
                }
            })
        }
    })
}

function validateLength(variable, msg, url, res) {
    if (variable.trim().length <= 0) {
        renderError(res, url, msg)
    }
}

function renderError(res, page, msg) {
    res.render(page, {
        error: msg
    })
}

function setDataSet(dataSet, smtpMailConfig, callback) {
    datasetAPIs(dataSet)
    forgottenPasswordController(dataSet, smtpMailConfig)
    callback(router)
}

module.exports = {
    setDataSet
}