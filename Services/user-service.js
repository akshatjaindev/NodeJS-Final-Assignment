/**
 * @author : akshatjain
 */
//Get the User info...

function getUser(User, username, callback) {
    User.findByPk(username)
        .then(user => {
            callback(user.get({
                plain: true
            }))
        })
        .catch(err => {
            callback({
                msg: 'User Not Found',
                reason: err
            })
        })
}

//Create User in DB...

function createUser(User, user, callback) {
    getUser(User, user.username, (resp) => {
        if (resp.msg === 'User Not Found') {
            User.build(user).save()
                .then(user => {
                    callback({
                        msg: 'Sign Up Successfully',
                        reason: {
                            username: user.username
                        }
                    })
                })
                .catch(err => {
                    callback({
                        msg: 'Error in Sign UP User',
                        reason: err
                    })
                })
        } else {
            callback({
                msg: 'Username Already Exsists'
            })
        }
    })
}

function resetPassword(User, username, user, callback) {
    User.update(user, {
        where: {
            username
        }
    })
    .then(user =>{
        callback({
            msg: 'Password Updated Successfully'
        })
    })
    .catch(err =>{
        callback({
            msg: 'Unable To Update Password',
            reason: err
        })
    })
}


module.exports = {
    getUser,
    createUser,
    resetPassword
}