/**
 * @author : akshatjain
 */

//User ORM

var User = (sequelize, api) => {
    return sequelize.define('users', {
        username: {
            type: api.STRING,
            primaryKey: true
        },
        password: {
            type: api.STRING,
            allowNull:false
        },
        DateOfBirth: {
            type: api.DATE,
            allowNull:false
        },
        collegeCompany:{
            type: api.STRING,
            allowNull: true
        }
    },{
        timestamps: false
    })
}

module.exports = (sequelize, api) => User(sequelize, api)