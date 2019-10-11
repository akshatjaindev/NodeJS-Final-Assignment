/**
 * @author : akshatjain
 */
var userService = require("../Services/user-service")
var encryption = require("./encryption")

let {
    getEncodedUser
} = encryption

function signInUser(User, username, password) {
    return new Promise((resolve, error) => {
        userService.getUser(User, username, user => {
            if (user.msg) {
                error({
                    error: 'login',
                    msg: user.msg
                })
            } else {
                //User Recieved
                if (user.password == password) {
                    resolve(user)
                } else {
                    error({
                        error: 'login',
                        msg: 'Invalid Password !!!'
                    })
                }
            }
        })
    })
}

function signupUser(User, user) {
    return new Promise((resolve, error) => {
        userService.createUser(User, user, resp => {
            if (resp.msg == 'Sign Up Successfully') {
                resolve(user)
            } else {
                error({
                    error: 'register',
                    msg: resp.msg
                })
            }
        })
    })
}

function processPasswordChangeRequest(User, username, password, cpassword, secret) {
    return new Promise((resolve, error) => {
        if (password.trim().length <= 0) {
            error({
                username,
                msg: 'Password Cannot Be Blank',
                secret
            })
        } else {
            if (password !== cpassword) {
                error({
                    username,
                    msg: 'Password Does Not Matched With Each Other',
                    secret
                })
            } else {
                //Finally Update Password And Redirect User...
                userService.resetPassword(User, username, {
                    password
                }, user => {
                    if (user.msg === 'Password Updated Successfully') {
                        resolve({
                            success: 'login',
                            msg: 'Password Reset Successfully Kindly Login'
                        })
                    } else {
                        error({
                            username,
                            msg: user.msg,
                            secret
                        })
                    }
                })
            }
        }
    })
}

function sendResetMail(transporter, UserDataSet, hostURL, resetEmail) {
    return new Promise((resolve, error) => {
        userService.getUser(UserDataSet, resetEmail, user => {
            if (user.msg) {
                error({
                    error: 'login',
                    msg: user.msg
                })
            } else {
                sendResetMailInternal(transporter, user.name, hostURL, resetEmail)
                    .then(resp => resolve(resp))
                    .catch(err => error(err))
            }
        })
    })
}

function sendResetMailInternal(transporter, name, host, resetEmail) {
    return new Promise((resolve, cerror) => {
        const mailBodyConfig = {
            from: 'Band App Support',
            to: resetEmail,
            subject: 'Request For Reset Password at Band App',
            html: getMailHTMLText(host, name, getEncodedUser(resetEmail))
        }
        transporter.sendMail(mailBodyConfig, (error, info) => {
            if (error) {
                cerror({
                    error: 'login',
                    msg: 'API Internal Error, Please Try After Some Time',
                    conso: error
                })
            } else {
                resolve({
                    success: 'login',
                    msg: 'E-Mail Sent Kindly Check it'
                })
            }
        })
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
    sendResetMail,
    processPasswordChangeRequest,
    signupUser,
    signInUser
}