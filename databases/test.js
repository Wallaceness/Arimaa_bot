var Tables = require("./tables");
var db = Tables.db;
var User = Tables.User;
var Game = Tables.Game;

db.sync({ force: true })
    .then(function() {
        User.create({
            username: 'Nathan'
        })
    })
