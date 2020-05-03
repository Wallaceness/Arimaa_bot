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

//app.post(`${api}/gameover`, function(request, response, next){
//    var color = request.body.color;//handle illegal moves
//    var board = request.body.board;
//    var setup = request.body.setup;
//    var move = request.body.move;
//    var id = request.body.id;
//    var winner=request.body.winner;
//    Games.findByPk(id)
//        .then(function(game) {
//            if (move && move!=='')game.dataValues.moves.push(move);
//            if (board !=='') game.dataValues.board.push(board);
//            console.log('game', game)
//            game.update({ moves: game.dataValues.moves, board: game.dataValues.board, winner: winner})
//            response.sendStatus(200);
//        })
//})

app.post(api+"/move", function(request, response, next){
    var color = request.body.color;
    var board = request.body.board;
    var setup = request.body.setup;
    var move = request.body.move;
    var id = request.body.id;
    var winner=request.body.winner;
    const endgame = checkEndgame(board)
    if (endgame.winner){
    //game won by player
        Games.findByPk(id)
            .then(function(game) {
                if (move && move!=='')game.dataValues.moves.push(move);
                if (board !=='') game.dataValues.board.push(board);
                console.log('game', game)
                game.update({ moves: game.dataValues.moves, board: game.dataValues.board, winner: endgame.winner})
                response.json({winner: endgame.winner, reason: endgame.reason});
                return
            })
    }
    else{
        child_process.exec("python ./arimaa_bot/shell_for_bot.py " + color + " " + board + " " + setup, function(error, stdout, stderr) {
            console.log(error, stdout, stderr)
            if (error) response.send(error);
            else if (stderr) response.send(stderr);
            else {
            Games.findByPk(id)
                        .then(function(game) {
                            let x = eval(stdout);
                            if (x[0].length===0){
                            //bot did not submit a move
                                if (move && move!=='')game.dataValues.moves.push(move);
                                if (board !=='') game.dataValues.board.push(board);
                                console.log('game', game)
                                game.update({ moves: game.dataValues.moves, board: game.dataValues.board, winner: oppositeColor[color]})
                                response.json({winner: oppositeColor[color], reason: "Invalid Move"});
                            }
                            else{
                                const endgame = checkEndgame(board)
                                if (endgame.winner){
                                    //game won by bot (yeah right..)
                                    if (move && move!=='')game.dataValues.moves.push(move);
                                    if (board !=='') game.dataValues.board.push(board);
                                    console.log('game', game)
                                    game.update({ moves: game.dataValues.moves, board: game.dataValues.board, winner: endgame.winner})
                                    response.json({winner: endgame.winner, reason: endgame.reason});
                                }
                                response.json({move: convertMove(x[0])});
                                console.log("update 2", id);
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
                            }
                        })
            }
        })
    }
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
        return {winner:"Gold", reason: "Elimination"}
    }
    else if (Rabbits===0){
        console.log( "Silver wins!")
        return {winner:"Silver", reason:"Elimination"}
    }
    //check goal
    for (let x=0, length=board.length-1; x<8; x++){
        if (board[x]==='R'){
            console.log( "Gold wins!")
            return {winner: "Gold", reason: "Goal"}
        }
        else if (board[length-x]==='r'){
            console.log( "Silver wins!")
            return {winner: "Silver", reason: "Goal"}
        }
    }
    let immobilized=checkMoves(board, "Gold");
    if (immobilized) return immobilized
    console.log("IM", immobilized);
    console.log("board", board);
    return {winner: false, reason: null}
}

function checkMoves(board, color){
    let ranks={"R":1, "C":2, "D":3, H: 4, M: 5, E: 6};
    let immobilizedGold=true;
    let immobilizedSilver=true;
    for (let x=0, length=board.length; x<length; x++){
        if (board[x]!==""){
            let adjacents=adjacent(x);
            if (ranks[board[x]] && immobilizedGold){
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
            else if (immobilizedSilver){
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
        return {winner: "Gold", reason: "Immobilization"};
    }
    else if (color==="Gold" && immobilizedGold){
        return {winner: "Silver", reason: "Immobilization"};
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

const oppositeColor={"silver": "gold", "gold": "silver"}

function toggle(space) {
        if (freeze) {
            return;
        }
        var location = gameboard[id[0]][id[2]];
        space.setAttribute('data-status', 'Selected');
        if (selected) {
            var adjacents = adjacent(selected);
            console.log(adjacents);
            var s_id = selected.id;
            var s_location = gameboard[s_id[0]][s_id[2]];
            if (pieces[other_color].indexOf(s_location) !== -1) {
                console.log('check');
                if (other_color == 'silver' && (+s_id[0] !== 0)) {
                    adjacents.push((+s_id[0] - 1) + '-' + s_id[2]);
                    console.log(adjacents);
                } else if (other_color == 'gold' && (+s_id[0] !== 7)) {
                    adjacents.push((+s_id[0] + 1) + '-' + s_id[2]);
                    console.log(adjacents);
                }
            }
            if (swap === false && gameboard[id[0]][id[2]] == '' && adjacents.indexOf(id) !== -1 && pushes.length === 1) {
                if (last_move) {
                    var last = gameboard[+last_move[1][0]][+last_move[1][2]];
                    console.log(pieces[color].indexOf(last) > pieces[other_color].indexOf(s_location));
                }
                if (pieces[color].indexOf(s_location) !== -1 && !is_frozen(selected)) {
                    move(id, s_id, adjacents, s_location, space);
                } else if (pieces[other_color].indexOf(s_location) !== -1 && pieces[color].indexOf(last) > pieces[other_color].indexOf(s_location) && moves.length > 0 && moves[moves.length - 1][0] === id) {
                    console.log("This is a pull!")
                    move(id, s_id, adjacents, s_location, space);
                } else if (pieces[other_color].indexOf(s_location) !== -1 && push_check(selected) && count < 3) {
                    console.log("This is a push!");
                    move(id, s_id, adjacents, s_location, space);
                }
            } else if (pushes.length !== 1) {
                console.log("Almost");
                if (pushes.indexOf(selected.id) !== -1 && pushes[0].indexOf(space.id) !== -1) {
                    console.log("PUSH!!!!!!!");
                    move(id, s_id, adjacents, s_location, space);
                    pushes = [
                        []
                    ];
                    moves[moves.length - 1].push("PUSH");
                }
            }
        }
        selected = space;
        update_moves();
        if (color === "gold" && gameboard[id[0]][id[2]] === 'R' && selected.id[0] == 0) {
            alert("Gold has won!");
            freeze = true;
            gameover = true;
            submit(true);
        } else if (color === "silver" && gameboard[id[0]][id[2]] === 'r' && selected.id[0] == 7) {
            alert("Silver has won!");
            freeze = true;
            gameover = true;
            submit(true);
        }
    }
