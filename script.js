'use strict';
var selected = null;
var gameboard = [
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '']
]
var traps = ['2-2', '2-5', '5-2', '5-5'];
var color = 'gold';
var other_color = 'silver';
var pieces = {
    'gold': ['R', 'C', 'D', 'H', 'M', 'E'],
    'silver': ['r', 'c', 'd', 'h', 'm', 'e']
};
var count = 0;
var pushes = [[]];
var freeze = false;
var last_move;
var moves = [];
var swap = true;
var gameover = false;
var computer_move = false;
var game_id = null;
var previous_move=null;

function start(color_choice) {
    gameboard = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
    ]
    freeze = false;
    gameover = false;
    swap = true;
    var gold = document.getElementById('gold');
    var silver = document.getElementById('silver');
    if (silver) {
        document.getElementById('turn').removeChild(silver);
    } else if (gold) {
        document.getElementById('turn').removeChild(gold);
    }
    if (color_choice === 'gold') {
        gameboard = gameboard.slice(0, 6);
        gameboard.push(['C', 'H', 'D', 'M', 'E', 'D', 'H', 'C']);
        gameboard.push(['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R']);
        seed_board();
        if (color === 'silver') {
            color = 'gold';
            change_color();
        }
    } else if (color_choice === 'silver') {
        color="silver";
        submit()
            .then(function() {
                gameboard = gameboard.slice(2);
                gameboard.unshift(['c', 'h', 'd', 'm', 'e', 'd', 'h', 'c']);
                gameboard.unshift(['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r']);
                console.log(gameboard);
                seed_board();
            });
    }
}

function change_color() {
    let div = document.createElement('div');
    let turn;
    if (color === 'silver') {
        turn = "Silver";
    } else {
        turn = "Gold";
    }
    turn = document.createTextNode(turn);
    div.appendChild(turn);
    div.id = color;
    let current = document.getElementById('turn');
    let silver = document.getElementById('silver');
    let gold = document.getElementById('gold');
    console.log(current, gold, silver, div);
    if (!silver && !gold) {
        current.appendChild(div);
    } else if (color === 'silver') {
        current.replaceChild(div, gold);
    } else if (color === 'gold') {
        current.replaceChild(div, silver);
    }
}

function update_moves() {
    if (swap) {
        return;
    }
    let div = document.createElement('div');
    let moves = document.createTextNode("moves left: " + (4 - count));
    div.appendChild(moves);
    div.id = "moves";
    let silver = document.getElementById('silver');
    let gold = document.getElementById('gold');
    let previous = document.getElementById('moves');
    let parent;
    if (!gold) {
        parent = silver;
    } else {
        parent = gold;
    }
    if (!previous) {
        parent.appendChild(div);
    } else {
        parent.replaceChild(div, previous);
    }
}

function setup(space) {
    if (swap === true) {
        if (color === "gold") {
            return +space.id[0] > 5;
        } else if (color === "silver") {
            return +space.id[0] < 2;
        }
    }
    return false;
}

function setup_move(id, s_id, adjacents, s_location, location, space) {
    selected.style.backgroundImage = "none";
    selected.style.opacity = 1;
    gameboard[id[0]][id[2]] = s_location;
    gameboard[s_id[0]][s_id[2]] = location;
    seed_space(space);
    seed_space(selected);
}

function createBoard() {
    var board = '';
    for (var i = 0; i < 8; i++) {
        board += "<tr>";
        for (var x = 0; x < 8; x++) {
            var id = i.toString() + "-" + x.toString();
            if (traps.indexOf(id) !== -1) {
                board += "<td data-status='not-selected' class='trap' id='" + id + "'></td>"
            } else {
                board += "<td data-status='not-selected' id='" + id + "'></td>"
            }
        }
        board += "</tr>";
    }
    document.getElementById('board').innerHTML = (board);
}

function toggle(space) {
    if (freeze) {
        return;
    }
    var id = space.id;
    var location = gameboard[id[0]][id[2]];
    space.setAttribute('data-status', 'Selected');
    if (selected) {
        var adjacents = find_adjacent(selected);
        console.log(adjacents);
        selected.setAttribute('data-status', 'not-selected')
        var s_id = selected.id;
        var s_location = gameboard[s_id[0]][s_id[2]];
        selected.style.border = "5px solid black";
        selected.style.opacity = 1;
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
        if (setup(space) == true && setup(selected) == true) {
            var temp = [s_id, id, adjacents, location, selected]
            setup_move(id, s_id, adjacents, s_location, location, space);
            selected = null;
            return;
        } else if (swap === false && gameboard[id[0]][id[2]] == '' && adjacents.indexOf(id) !== -1 && pushes.length == 1) {
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
    if (selected) {
        seed_space(selected);
    }
    //space.style.border="5px solid blue";
    space.style.opacity = .5;
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

function two_things() {
    createBoard();
    for (var i = 0; i < 8; i++) {
        for (var x = 0; x < 8; x++) {
            var Id = i.toString() + "-" + x.toString();
            document.getElementById(Id).onclick = function() {
                if (computer_move) return;
                toggle(this);
            };
        }
    }
    seed_board();
}

function seed_space(space) {
    space.style.border = "5px solid black";
    var id = space.id;
    if (trap_check(space) === true) {
        var record = [id, gameboard[id[0]][id[2]]];
        space.style.backgroundImage = 'none';
        space.style.opacity = 1;
        gameboard[id[0]][id[2]] = '';
        return record
    }
    var board = gameboard[id[0]][id[2]];
    if (board == '') {
        space.style.backgroundImage = "none";
        space.style.opacity = 1;
    } else if (board == 'e' || board == 'E') {
        space.style.backgroundImage = "url(./pictures/elephant.jpg)"
        space.style.backgroundSize = "cover";
        // if (board=='e'){
        // 	space.style.border="5px solid silver";
        // }
    } else if (board == 'm' || board == 'M') {
        space.style.backgroundImage = "url(./pictures/camel.jpg)"
        space.style.backgroundSize = "cover";
        // if (board=='m'){
        // 	space.style.opacity=0.5;
        // }
    } else if (board == 'h' || board == 'H') {
        space.style.backgroundImage = "url(./pictures/horse.png)"
        space.style.backgroundSize = "cover";
        // if (board=='h'){
        // 	space.style.opacity=0.5;
        // }
    } else if (board == 'd' || board == 'D') {
        space.style.backgroundImage = "url(./pictures/dog.jpg)"
        space.style.backgroundSize = "cover";
        // if (board=='d'){
        // 	space.style.opacity=0.5;
        // }
    } else if (board == 'c' || board == 'C') {
        space.style.backgroundImage = "url(./pictures/cat.jpg)"
        space.style.backgroundSize = "cover";
        // if (board=='c'){
        // 	space.style.opacity=0.5;
        // }
    } else if (board == 'r' || board == 'R') {
        space.style.backgroundImage = "url(./pictures/rabbit.jpg)"
        space.style.backgroundSize = "cover";
        // if (board=='r'){
        // 	space.style.opacity=0.5;
        // }
    }
    if (pieces.silver.indexOf(board) !== -1) {
        space.style.border = "5px solid silver";
    }
    if (pieces.gold.indexOf(board) !== -1) {
        space.style.border = "5px solid gold";
    }
}

function seed_board() {
    for (var row in gameboard) {
        for (var space in gameboard[row]) {
            var location = document.getElementById(row.toString() + "-" + space.toString());
            seed_space(location);
        }
    }
}

function find_adjacent(space) {
    var id = space.id;
    var row = +id[0];
    var column = +id[2];
    var temp = [(row - 1).toString() + '-' + column.toString(),
        (row + 1).toString() + '-' + column.toString(),
        row.toString() + '-' + (column + 1).toString(),
        row.toString() + '-' + (column - 1).toString()
    ];
    var adjacents = [];
    for (var x in temp) {
        if ((temp[x][0] !== '-' && temp[x][0] !== '8') && (temp[x][2] !== '-' && temp[x][2] !== '8')) {
            adjacents.push(temp[x]);
        }
    }
    if (gameboard[row][column] === 'r' && row !== 0) {
        var index = adjacents.indexOf((row - 1).toString() + '-' + column.toString());
        adjacents.splice(index, 1);
    } else if (gameboard[row][column] === 'R' && row !== 7) {
        var index = adjacents.indexOf((row + 1).toString() + '-' + column.toString());
        adjacents.splice(index, 1);
    }
    return adjacents;
}

function trap_check(space) {
    var location = gameboard[+space.id[0]][+space.id[2]];
    if (pieces['gold'].indexOf(location) !== -1) {
        var color = 'gold';
    } else {
        var color = 'silver'
    }
    if (traps.indexOf(space.id) !== -1) {
        var adjacents = find_adjacent(space);
        adjacents.push((+space.id[0] - 1).toString() + '-' + space.id[2]);
        adjacents.push((+space.id[0] + 1).toString() + '-' + space.id[2]);
        for (var item in adjacents) {
            var piece = gameboard[+adjacents[item][0]][+adjacents[item][2]];
            if (pieces[color].indexOf(piece) !== -1) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function is_frozen(space) {
    var adjacents = find_adjacent(space);
    var frozen = false;
    var this_piece = gameboard[+space.id[0]][+space.id[2]];
    if (this_piece == 'r' && +space.id[0] > 0) {
        adjacents.push((+space.id[0] - 1).toString() + '-' + space.id[2]);
    } else if (this_piece == 'R' && +space.id[0] < 7) {
        adjacents.push((+space.id[0] + 1).toString() + '-' + space.id[2]);
    }
    for (var item in adjacents) {
        var other_piece = gameboard[+adjacents[item][0]][+adjacents[item][2]];
        if (pieces[color].indexOf(other_piece) !== -1) {
            return false;
        }
        if ((pieces[other_color].indexOf(other_piece) !== -1) && (pieces[other_color].indexOf(other_piece) > pieces[color].indexOf(this_piece)))
            frozen = true;
    }
    return frozen;
}

function push_check(space) {
    pushes[0].push(space.id);
    var truth = false;
    var location = gameboard[+space.id[0]][+space.id[2]];
    if (pieces['gold'].indexOf(location) !== -1) {
        var color = 'gold';
        var other_color = 'silver';
    } else {
        var color = 'silver';
        var other_color = 'gold';
    }
    var adjacents = find_adjacent(space);
    var this_piece = gameboard[+space.id[0]][+space.id[2]];
    adjacents.push((+space.id[0] - 1).toString() + '-' + space.id[2]);
    adjacents.push((+space.id[0] + 1).toString() + '-' + space.id[2]);
    for (var item in adjacents) {
        var other_piece = gameboard[+adjacents[item][0]][+adjacents[item][2]];
        if ((pieces[other_color].indexOf(other_piece) !== -1) && (pieces[other_color].indexOf(other_piece) > pieces[color].indexOf(this_piece))) {
            pushes.push(adjacents[item]);
            truth = true;
        }
    }
    return truth;
}

function move(id, s_id, adjacents, s_location, space) {
    selected.style.backgroundImage = "none";
    selected.style.opacity = 1;
    gameboard[id[0]][id[2]] = s_location;
    gameboard[s_id[0]][s_id[2]] = '';
    moves.push([s_id, id]);
    var captures = [];
    last_move = [s_id, id];
    console.log(last_move);
    for (var x in adjacents) {
        var x = seed_space(document.getElementById(adjacents[x]));
        if (x) {
            captures.push(x);
        }
    }
    if (captures.length > 0) {
        moves[moves.length - 1].push(captures);
    }
    console.log(moves);
    count += 1;
    if (count === 4) {
        freeze = true;
    }
}

function submit(end) {
    if (gameover === true && !end) {
        return;
    }
    if (count > 0 || swap) {
        count = 0;
        freeze = false;
        computer_move = true;
        if (color === 'gold') {
            color = 'silver';
            other_color = 'gold';
        } else {
            color = 'gold';
            other_color = 'silver';
            if (game_id && swap){
                swap=false;
            }
        }
        change_color();
        let m = [];
        for (var step in moves) {
            var s=moves[step];
            var location=s[0];
            var destination=s[1];
            var l=location.split('-');
            var lr=l[1];
            var lc=l[0];
            var d=destination.split('-');
            var dc=d[0];
            var dr=d[1];
            if (+lr>+dr) m.push(location+" west");
            else if (+lr<+dr) m.push(location+" east");
            else if (+lc>+dc) m.push(location+" north");
            else if (+lc<+dc) m.push(location+" south");
        }
        var winner=false;
        moves = [];
        update_moves();
        if (gameover){
            winner=color;
            return $.post("/api/gameover", { color: color, board: gameboard.toString(), setup: swap, move: m.toString(), id: game_id, winner: winner}, function(data){
                console.log(data)
            })
        }
        else if (swap){
            return $.post('/api/setup', { color: color, board: gameboard.toString(), setup: true, move: m.toString(), id: game_id, winner: winner}, function(data) {
                game_id=data.id;
                var x=data.board
                var new_board = [];
                count = 0;
                var sub = [];
                for (var i in x) {
                    count += 1;
                    if (x[i] === " ") {
                        x[i] = ''
                    }
                    sub.push(x[i])
                    if (count === 8) {
                        new_board.push(sub);
                        sub = [];
                        count = 0;
                    }
                }
                gameboard = new_board;
                seed_board();
                console.log(gameboard);
                if (color === 'silver') {
                    color = 'gold';
                    other_color = 'silver';
                    swap=false;
                } else {
                    color = 'silver';
                    other_color = 'gold';
                }
                freeze = false;
                computer_move = false;
                change_color();
            })
        }
        else{
            return $.post('/api/move', { color: color, board: gameboard.toString(), setup: swap, move: m.toString(), id: game_id, winner: winner}, function(data) {
                let move = 0;
                console.log(data);
                previous_move=[];
                //console.log("previous move", previous_move)
                var interval = setInterval(function() {
                    if (move === data.move.length) {
                        clearInterval(interval);
                        console.log(gameboard);
                        if (color === 'silver') {
                            color = 'gold';
                            other_color = 'silver';
                            if (swap) {
                                swap = false;
                            }
                        } else {
                            color = 'silver';
                            other_color = 'gold';
                        }
                        freeze = false;
                        count = 0;
                        moves = [];
                        computer_move = false;
                        change_color();
                        update_moves();
                        return;
                    }
                    var split = data.move[move].split(' ');
                    var space = split[0];
                    var direction = split[1];
                    var split2=space.split("-")
                    var row=parseInt(split2[0])
                    var column=parseInt(split2[1])
                    var piece = document.getElementById(space);
                    toggle(piece);
                    var destination;
                    var tracker = count;
                    if (direction === "south") {
                        destination = document.getElementById((row + 1) + '-' + column);
                    } else if (direction === "north") {
                        destination = document.getElementById((row - 1) + '-' + column)
                    } else if (direction === "east") {
                        destination = document.getElementById(row + '-' + (column + 1));
                    } else if (direction === "west") {
                        destination = document.getElementById(row + '-' + (column - 1));
                    }
                    previous_move.push(space+' '+direction);
                    toggle(destination);
                    console.log(tracker, count);
                    if (count === tracker) {
                        alert("Bot has submitted an illegal move. You win by forfeit.");
                        gameover = true;
                        freeze = true;
                        clearInterval(interval);
                        submit(true);
                        return;
                    }
                    //call toggle function here after having set selected to first space and calculated
                    //second space by direction
                    move += 1;
                }, 500);
            })
        }
    }
}

function undo() {
    if (moves.length === 0 || gameover == true) {
        return;
    }
    var last_move = moves.pop();
    var last_space = document.getElementById(last_move[0]);
    var select = document.getElementById(last_move[1]);
    var adjacents = find_adjacent(select);
    //selected.style.border="5px solid black";
    gameboard[+last_space.id[0]][+last_space.id[2]] = gameboard[+select.id[0]][+select.id[2]];
    gameboard[select.id[0]][select.id[2]] = '';
    seed_space(last_space);
    seed_space(select);
    console.log(last_move);
    if (last_move.length > 2 && last_move[2] != "PUSH") {
        for (var x in last_move[2]) {
            if (last_move[2][x][0] == last_move[1]) {
                console.log(last_move[0][0], last_move[0][2]);
                gameboard[+last_move[0][0]][+last_move[0][2]] = last_move[2][x][1];
                seed_space(document.getElementById(last_move[0]));
            } else {
                console.log(last_move[2][x][0][0], last_move[2][x][0][2], last_move[2][x][1]);
                gameboard[+last_move[2][x][0][0]][+last_move[2][x][0][2]] = last_move[2][x][1];
                console.log(gameboard);
                seed_space(document.getElementById(last_move[2][x][0]));
            }
        }
    }
    if (last_move[last_move.length - 1] == "PUSH") {
        count -= 1;
        return undo();
    }
    console.log(moves);
    count -= 1;
    freeze = false;
    selected.style.opacity = 1;
    selected = last_space;
    selected.style.opacity = .5;
    seed_space(selected);
    pushes = [
        []
    ];
    update_moves();
}
