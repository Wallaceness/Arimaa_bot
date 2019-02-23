var Tables = require("./tables");
var db = Tables.db;
var User = Tables.Users;
var Game = Tables.Games;

db.sync({ force: true })
    .then(function() {
        User.create({
            username: 'Nathan'
        })
    })
