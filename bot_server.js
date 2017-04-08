var child_process = require("child_process");
var express = require("express");
var bodyparser = require('body-parser');
var app = express();
var database = require("./databases/tables");
var Users = database.User;
var Games = database.Game;

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(__dirname));

var port = app.listen(process.env.PORT || 8080);
app.listen(port, function() {
    console.log("Ready to Play!");
})

app.get('/', function(request, response, next) {
    console.log("get received!");
    response.sendFile(__dirname + '/board.html');
})

app.post('/', function(request, response, next) {
    console.log("post received!", request.body);
    var color = request.body.color;
    var board = request.body.board;
    var setup = request.body.setup;
    var move = request.body.move;
    var id = request.body.id;
    var winner=request.body.winner;
    var promise1=null;
    console.log("move", request.body.move);
    if (id == '') {
        console.log("creating game...");
        promise1 = Games.create({ moves: [], board: [], userId: 1 })
        .then(function(game) {
            id = game.id;
            console.log("game created", id);
        })
    } else if (winner!=='false'){
        promise1=Games.findById(id)
        .then(function(game) {
            game.dataValues.moves.push(move);
            if (board !=='') game.dataValues.board.push(board);
            console.log('game', game)
            game.updateAttributes({ moves: game.dataValues.moves, board: game.dataValues.board, winner: winner})
            return game;
        })

    }
    else {
        promise1=Promise.resolve();
    }
    promise1
    .then(function() {
        if (winner!='false') return;
        child_process.exec("python ./arimaa_bot/shell_for_bot.py " + color + " " + board + " " + setup, function(error, stdout, stderr) {
            console.log(error, stdout, stderr)
            if (error) response.send(error);
            else {
                if (stderr) response.send(stderr);
                else {
                    var x = eval(stdout);
                    if (x.length != 2) {
                        response.json([x, id]);
                        console.log("update 1", id)
                        Games.findById(id)
                        .then(function(game) {
                            game.dataValues.moves.push([]);
                            game.dataValues.board.push(stdout)
                            game.updateAttributes({ moves: game.dataValues.moves, board: game.dataValues.board });
                        })
                    } else {
                        response.json(x[0]);
                        console.log("update 2", id);
                        Games.findById(id)
                        .then(function(game) {
                            game.dataValues.moves.push(move);
                            if (board !=='') game.dataValues.board.push(board);
                            game.dataValues.board.push(x[1].toString());
                            console.log('game', game)
                            game.updateAttributes({ moves: game.dataValues.moves, board: game.dataValues.board});
                        })
                    }
                }
            }
        })
    })
})

app.get('/users/:userid', function(request, response, next) {
    Users.findById(request.params.userid)
        .then(function(user) {
            if (user) {
                response.status = 201;
                response.send(user);
            } else {
                response.status = 404;
                response.send("User does not exist.");
            }
        })
})

app.get('/games/:gameid', function(request, response, next) {
    Games.findById(request.params.gameid)
        .then(function(game) {
            if (game) {
                response.status = 201;
                response.send(game);
            } else {
                response.status = 404;
                response.send("Invalid game ID.")
            }
        })
})
