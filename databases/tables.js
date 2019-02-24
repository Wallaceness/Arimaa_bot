var Sequelize = require("sequelize");
var tables = new Sequelize(process.env.DATABASE_URL || "postgres://localhost:5432/arimaa")
console.log("DB_URL", process.env.DATABASE_URL);

var Users = tables.define('users', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

var Games = tables.define('games', {
    winner: {
        type: Sequelize.STRING,
    },
    moves: {
        type: Sequelize.ARRAY(Sequelize.STRING)
    },
    board: {
        type: Sequelize.ARRAY(Sequelize.STRING)
    }
})

Users.hasMany(Games);
Games.belongsTo(Users);

module.exports = {
    Users: Users,
    Games: Games,
    db: tables
}
