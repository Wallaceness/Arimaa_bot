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
    response.sendFile(path.join(__dirname,'homepage.html'));
})

app.post(`${api}/new`, function(request, response, next){
    Games.create({ moves: [], board: [], userId: 1 })
    .then((game)=>{
        response.json({id: game.id})
    })
})

app.get(`${api}/lastmove/:gameid`, function(request, response, next){
    Games.findByPk(request.params.gameid)
    .then((game)=>{
        //if the board array has an odd number of boards, that means the last move was Gold's and therefore it is Silver's turn.
        let color=((game.dataValues.board.length%2===1) ? "silver" : "gold");
        response.json({
            id: game.dataValues.id, 
            board: game.dataValues.board[game.dataValues.board.length-1] || null, 
            color: color, 
            setup: game.dataValues.moves.length<2 ? true: false 
        } );
    })
})

app.post(api+"/setup", function(request, response, next){
    console.log("In the server:", database, Users, Games)
    var color = request.body.color;
    var board = request.body.board;
    var setup = request.body.setup;
    var move = request.body.move;
    var id = request.body.id;
    var winner=request.body.winner;
    Games.findByPk(id)
    .then((game)=>{
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
                    game.update({ moves: game.dataValues.moves, board: game.dataValues.board });
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
    Games.findByPk(id)
        .then(function(game) {
            if (move && move!=='')game.dataValues.moves.push(move);
            if (board !=='') game.dataValues.board.push(board);
            console.log('game', game)
            game.update({ moves: game.dataValues.moves, board: game.dataValues.board, winner: winner})
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
    if (checkEndgame(board)){
        response.send(color + " wins!")
    }
    child_process.exec("python ./arimaa_bot/shell_for_bot.py " + color + " " + board + " " + setup, function(error, stdout, stderr) {
        console.log(error, stdout, stderr)
        if (error) response.send(error);
        else if (stderr) response.send(stderr);
        else {
            var x = eval(stdout);
                response.json({move: convertMove(x[0])});
                console.log("update 2", id);
                Games.findByPk(id)
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
                    // console.log('game', game)
                    game.update({ moves: game.dataValues.moves, board: game.dataValues.board});
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
    Games.findByPk(request.params.gameid)
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
    Games.findByPk(request.params.gameid)
    .then(function(game){
        if (game.winner){
            response.sendFile(path.join(__dirname, "view_game.html"))
        }
        else{
            response.sendFile(path.join(__dirname,'board.html'));
        }
    })
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

function checkEndgame(board){
    //check rabbits
    board=board.split(",");
    let rabbits=0;
    let Rabbits=0;
    board.forEach((space)=>{
        if(space==="r"){
            rabbits+=1;
        }
        else if(space==="R"){
            Rabbits+=1;
        }
    });
    if (rabbits===0){
        console.log( "Gold wins!")   
    }
    else if (Rabbits===0){
        console.log( "Silver wins!")
    }
    //check goal
    for (let x=0, length=board.length-1; x<8; x++){
        if (board[x]==='R'){
            console.log( "Gold wins!")       
        }
        else if (board[length-x]==='r'){
            console.log( "Silver wins!")
        }
    }
    let immobilized=checkMoves(board, "Gold");
    console.log("IM", immobilized);
    console.log("board", board);
    return false
}

function checkMoves(board, color){
    let ranks={"R":1, "C":2, "D":3, H: 4, M: 5, E: 6};
    let immobilizedGold=true;
    let immobilizedSilver=true;
    for (let x=0, length=board.length; x<length; x++){
        if (board[x]!==""){
            let adjacents=adjacent(x);
            if (ranks[board[x]]){
                //gold piece
                let piece=ranks[board[x]];
                let frozen=false;
                for (let a=0; a<adjacents.length; a++){
                    if (ranks[board[adjacents[a]]]){
                        frozen=false;
                        break;
                    }
                    else if(board[adjacents[a]]!=="" && ranks[board[adjacents[a]].toUpperCase()] && ranks[board[adjacents[a]].toUpperCase()] > piece){
                        frozen=true;
                    }
                }
                if (!frozen){
                    for (let b=0; b<adjacents.length; b++){
                        if (board[adjacents[b]]===""){
                            immobilizedGold=false;
                            break;
                        }
                        else if (ranks[board[adjacents[b]].toUpperCase()]){
                            let adjacents2=adjacent(adjacents[b]);
                            let br=false;
                            adjacents2.splice(adjacents2.indexOf(x), 1);
                            for (let c=0; c<adjacents2.length; c++){
                                if (board[adjacents2[c]]===""){
                                    immobilizedGold=false;
                                    br=true;
                                    break;
                                }
                            }
                            if (br) break
                        }
                    }
                }
            }
            else{
                //silver piece
                let adjacents=adjacent(x);
                let piece=ranks[board[x].toUpperCase()];
                let frozen=false;
                for (let a=0; a<adjacents.length; a++){
                    if (board[adjacents[a]]!=="" && !ranks[board[adjacents[a]]]){
                        frozen=false;
                        break;
                    }
                    else if(ranks[board[adjacents[a]]] && ranks[board[adjacents[a]]] > piece){
                        frozen=true;
                    }
                }
                if (!frozen){
                    for (let b=0; b<adjacents.length; b++){
                        if (board[adjacents[b]]===""){
                            immobilizedSilver=false;
                            break;
                        }
                        else if (ranks[board[adjacents[b]]]){
                            let adjacents2=adjacent(adjacents[b]);
                            let br=false;
                            adjacents2.splice(adjacents2.indexOf(x), 1);
                            for (let c=0; c<adjacents2.length; c++){
                                if (board[adjacents2[c]]===""){
                                    immobilizedSilver=false;
                                    br=true;
                                    break;
                                }
                            }
                            if (br) break
                        }
                    }
                }
            }
        }
    }
    if (color==="Silver" && immobilizedSilver){
        return "Gold Wins!";
    }
    else if (color==="Gold" && immobilizedGold){
        return "Silver Wins!";
    }
}


function adjacent(location){
    let adjacents=[location-8, location+1, location+8, location-1]
    if (location >=0 && location<8){
        adjacents.splice(adjacents.indexOf(location-8), 1);
    }
    if (location>=56 && location<64){
        adjacents.splice(adjacents.indexOf(location+8), 1);
    }
    if (location%8===0){
        adjacents.splice(adjacents.indexOf(location-1), 1);
    }
    if (location%8===7){
        adjacents.splice(adjacents.indexOf(location+1), 1);
    }
    return adjacents
}
