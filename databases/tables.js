var Sequelize = require("Sequelize");
var tables = new Sequelize("postgres://localhost:5432/arimaa")

var User = tables.define('user', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    }
})

var Game = tables.define('game', {
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

User.hasMany(Game);
Game.belongsTo(User);

module.exports = {
    User: User,
    Game: Game,
    db: tables
}
