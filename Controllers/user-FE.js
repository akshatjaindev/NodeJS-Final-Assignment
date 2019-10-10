/**
 * @author : akshatjain
 */
var express = require("express")
var userService = require("../Services/user-service")
var encryption = require("../Services/encryption")

var router = express.Router()

let {
    getEncodedUser,
    getDecodedUser
} = encryption

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

        signInUser(UserDataSet, username, password, req, res)
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
        signupUser(UserDataSet, user, req, res)
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
                processPasswordChangeRequest(UserDataSet, username, password, cpassword, secret, res)
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
            userService.getUser(UserDataSet, resetEmail, user => {
                if (user.msg) {
                    renderError(res, 'login', user.msg)
                } else {
                    sendResetMail(transporter, user.name, resetEmail,req, res)
                }
            })
        }
    })
}

function signInUser(User, username, password, req, res) {
    userService.getUser(User, username, user => {
        if (user.msg) {
            renderError(res, 'login', user.msg)
        } else {
            //User Recieved
            if (user.password == password) {
                req.session.user = {
                    username: username,
                    name: user.name
                }
                res.redirect("/")
            } else {
                renderError(res, 'login', 'Invalid Password !!!')
            }
        }
    })
}

function signupUser(User, user, req, res) {
    userService.createUser(User, user, resp => {
        if (resp.msg == 'Sign Up Successfully') {
            req.session.user = {
                username: resp.reason.username
            }
            res.redirect("/")
        } else {
            renderError(res, 'register', resp.msg)
        }
    })
}

function processPasswordChangeRequest(User, username, password, cpassword, secret, res) {
    if (password.trim().length <= 0) {
        renderResetUI(username, 'Password Cannot Be Blank', secret, res)
    } else {
        if (password !== cpassword) {
            renderResetUI(username, 'Password Does Not Matched With Each Other', secret, res)
        } else {
            //Finally Update Password And Redirect User...
            userService.resetPassword(User, username, {
                password
            }, user => {
                if (user.msg === 'Password Updated Successfully') {
                    renderError(res, 'login', 'Password Reset Successfully Kindly Login')
                } else {
                    renderResetUI(username, user.msg, secret, res)
                }
            })
        }
    }
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

function sendResetMail(transporter, name, resetEmail, req, res) {
    const mailBodyConfig = {
        from: 'Band App Support',
        to: resetEmail,
        subject: 'Request For Reset Password at Band App',
        html: getMailHTMLText(req.headers.host, name, getEncodedUser(resetEmail))
    }
    transporter.sendMail(mailBodyConfig, (error, info) => {
        if (error) {
            res.redirect('/')
        } else {
            renderError(res, 'login', 'E-Mail Sent Kindly Check it')
        }
    })
}

function getMailHTMLText(preURL, name, token) {
    let link = `${preURL}/reset?secret=${token}`
    let html = `
    <h2>Dear ${name},</h2>
    <p>
    It seems you have requested to change the password for the Band App,
    <br>
    Kindly <a href='http://${link}'>click here</a> to reset your password,
    <br>
    If You are unable to Go Through kindly copy and paste the below link:
    <br>
    <br>
    http://${link}
    <br>
    <br>
    <b>If You Have Not Requested, Kindly Ignore this Mail...</b>
    </p>
    <h3>
    Thanks,
    <br>
    Band App Support
    </h3>`

    return html
}

module.exports = {
    setDataSet
}