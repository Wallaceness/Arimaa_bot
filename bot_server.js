var child_process = require("child_process");
var express = require("express");
var bodyparser = require('body-parser');
var app = express();
var database = require("./databases/tables");
const path=require("path");
var Users = database.Users;
var Games = database.Games;


const api="/api"

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname)));

var port = app.listen(process.env.PORT || 8080);
app.listen(port, function() {
    console.log("Ready to Play!");
})

app.get('/', function(request, response, next) {
    console.log("get received!");
    response.sendFile(path.join(__dirname,'board.html'));
})

app.post(api+"/setup", function(request, response, next){
    console.log("In the server:", database, Users, Games)
    var color = request.body.color;
    var board = request.body.board;
    var setup = request.body.setup;
    var move = request.body.move;
    var id = request.body.id;
    var winner=request.body.winner;
    promise1=null;
    if(!id || id===""){
        promise1=Games.create({ moves: [], board: [], userId: 1 }) 
    }
    else{
        promise1=Promise.resolve(true)
    }
    promise1
        .then(function(game) {
            id = game.id;
            console.log("game created", id);
            child_process.exec("python ./arimaa_bot/shell_for_bot.py " + color + " " + board + " " + setup, function(error, stdout, stderr) {
            console.log(error, stdout, stderr)
            if (error) response.send(error);
            else if (stderr) response.send(stderr);
            else {
                var x = eval(stdout);
                response.json({board: x, id: id});
                console.log("update 1", id)
                if (color==="silver"){
                    game.dataValues.moves.push("Gold setup")
                    game.dataValues.board.push(board)
                }
                    game.dataValues.moves.push(color.slice(0, 1).toUpperCase()+color.slice(1)+" setup");
                    game.dataValues.board.push(x.toString())
                    game.updateAttributes({ moves: game.dataValues.moves, board: game.dataValues.board });
            }
        })
        })
})

app.post(`${api}/gameover`, function(request, response, next){
    var color = request.body.color;//handle illegal moves
    var board = request.body.board;
    var setup = request.body.setup;
    var move = request.body.move;
    var id = request.body.id;
    var winner=request.body.winner;
    Games.findById(id)
        .then(function(game) {
            if (move && move!=='')game.dataValues.moves.push(move);
            if (board !=='') game.dataValues.board.push(board);
            console.log('game', game)
            game.updateAttributes({ moves: game.dataValues.moves, board: game.dataValues.board, winner: winner})
            response.sendStatus(200);
        })
})

app.post(api+"/move", function(request, response, next){
    var color = request.body.color;
    var board = request.body.board;
    var setup = request.body.setup;
    var move = request.body.move;
    var id = request.body.id;
    var winner=request.body.winner;
    child_process.exec("python ./arimaa_bot/shell_for_bot.py " + color + " " + board + " " + setup, function(error, stdout, stderr) {
        console.log(error, stdout, stderr)
        if (error) response.send(error);
        else if (stderr) response.send(stderr);
        else {
            var x = eval(stdout);
                response.json({move: convertMove(x[0])});
                console.log("update 2", id);
                Games.findById(id)
                .then(function(game) {
                    if (!move || move===""){
                        game.dataValues.moves.push("Silver setup")
                    }
                    else{
                        game.dataValues.moves.push(move);
                    }
                    game.dataValues.moves.push(convertMove(x[0]).join(","));
                    if (board !=='') game.dataValues.board.push(board);
                    game.dataValues.board.push(x[1].toString());
                    console.log('game', game)
                    game.updateAttributes({ moves: game.dataValues.moves, board: game.dataValues.board});
                })
        }
    })
})

app.get(`${api}/users/:userid`, function(request, response, next) {
    Users.findOne({where: {id: request.params.userid}, include: [{model:Games}]})
        .then(function(user) {
            console.log(user)
            if (user) {
                response.status = 201;
                const games=user.games.map((game)=>{
                    return {id: game.id, winner: game.winner, moves: Math.ceil(game.board.length/2), time: game.createdAt}
                })
                response.json({userid: user.id, username: user.username, games: games});
            } else {
                response.status = 404;
                response.send("User does not exist.");
            }
        })
})

app.get("/users/:userid", function(request, response, next){
    response.sendFile(path.join(__dirname, "games_list.html"))
})

app.get(`${api}/games/:gameid`, function(request, response, next){
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

app.get('/games/:gameid', function(request, response, next) {
    response.sendFile(path.join(__dirname, "view_game.html"))
})

function convertMove(move){
    let moves=[]
    for (let x=0; x<move.length; x++){
        var split = move[x].split(' ');
        var space = split[0];
        var direction = split[1];
        switch(direction){
            case "north":
                direction="south"
                break;
            case "south":
                direction="north";
                break;
            case "east":
                direction="west";
                break;
            case "west":
                direction="east";
                break;
            default:
                throw new error("Invalid direction.")
        }
        console.log(space, typeof(+space));
        if (typeof(+space) !== 'number') {
            space = space.slice(1);
        }
        space = 63 - (+space);
        var row = Math.floor(space / 8);
        var column = space % 8;
        console.log(row, column);
        moves.push(`${row}-${column} ${direction}`)
    }
    return moves
}
