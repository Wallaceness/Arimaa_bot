var Tables = require("./tables");
var db = Tables.db;
var User = Tables.Users;
var Game = Tables.Games;
console.log("seed", process.env.DATABASE_URL)

db.sync({ force: true })
    .then(function() {
    	console.log("Hello world.")
        User.create({
            username: 'Nathan'
        })
    })
