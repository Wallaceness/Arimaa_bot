"use strict";

$('document').ready(function(){
	var moves;
	var boards;
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
	var traps = ['2-2', '2-5', '5-2', '5-5'];
    var currentMove=null;
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

	function createBoard() {
        var board = '';
        for (var i = 0; i < 8; i++) {
            board += "<tr>";
            for (var x = 0; x < 8; x++) {
                var id = i.toString() + "-" + x.toString();
                if (traps.indexOf(id) !== -1) {
                    board += "<td data-status='not-selected' class='trap' id='" + id + "'></td>"
                } else {
                    if(x==0){
                        board+="<td id='label-rows-"+i+"' class='label-cell right-border'>"+(8-parseInt(i)).toString()+"</td>"
                    }
                    board += "<td data-status='not-selected' id='" + id + "'></td>"
                }
            }
            board += "</tr>";
        }
        board+="<tr>"
        for (var d=0; d<9; d++){
            if (d===0){
                board+="<td class='label-cell'></td>"
            }
            else{
                board+="<td id='label-cols-"+String.fromCharCode(64+d)+"' class='label-cell top-border'>"+String.fromCharCode(64+d)+"</td>"
            }
        }
        board+="</tr>"
        console.log(document.getElementById('view-board'))
        document.getElementById('view-board').innerHTML = (board);
	}

    function createTable(){
    	var table=""
    	for (var y=0; y<moves.length; y++){
    		table+="<tr id='move-"+y+"' class='"+(y%2==1?"silver-move":"gold-move")+"'><td class='right-border'>"+(Math.floor(y/2+1))+(y%2==1?"s":"g")+"</td><td><div class='left-padding'>"+convertMove(moves[y])+"</div></td></tr>"
    	}
    	document.getElementById("view-moves").innerHTML=table;
        var playButton=document.getElementById("play-button")
        playButton.onclick=playMove;
        for (var b = 0; b < moves.length; b++) {
            var Id = "move-"+b
            document.getElementById(Id).onclick = function() {
                if (currentMove){
                    document.getElementById(currentMove).classList.remove("selected-move");
                }
                currentMove=this.id;
                this.classList.add("selected-move");
                var index=this.id.split("-")[1]
                setMove(index);
            };
    }
    }

    function setMove(move){
        if (boards[move][0]!=="["){
            gameboard=boards[move].split(",")
        }
        else{
            gameboard=JSON.parse(boards[move]);
        }
        gameboard=convertBoard(gameboard);
        seed_board();
    }

    function seed_space(space) {
        space.style.border = "2px solid black";
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
            space.style.backgroundImage = "url(../pictures/elephant.jpg)"
            space.style.backgroundSize = "cover";
        } else if (board == 'm' || board == 'M') {
            space.style.backgroundImage = "url(../pictures/camel.jpg)"
            space.style.backgroundSize = "cover";
        } else if (board == 'h' || board == 'H') {
            space.style.backgroundImage = "url(../pictures/horse.png)"
            space.style.backgroundSize = "cover";
        } else if (board == 'd' || board == 'D') {
            space.style.backgroundImage = "url(../pictures/dog.jpg)"
            space.style.backgroundSize = "cover";
        } else if (board == 'c' || board == 'C') {
            space.style.backgroundImage = "url(../pictures/cat.jpg)"
            space.style.backgroundSize = "cover";
        } else if (board == 'r' || board == 'R') {
            space.style.backgroundImage = "url(../pictures/rabbit.jpg)"
            space.style.backgroundSize = "cover";
        }
        if (pieces.silver.indexOf(board) !== -1) {
            space.style.border = "2px solid silver";
        }
        if (pieces.gold.indexOf(board) !== -1) {
            space.style.border = "2px solid gold";
        }
    }

    function convertBoard(board){
        var new_board = [];
                count = 0;
                var sub = [];
                for (var c=0; c<board.length; c++) {
                    count += 1;
                    if (board[c] === " ") {
                        board[c] = ''
                    }
                    sub.push(board[c])
                    if (count === 8) {
                        new_board.push(sub);
                        sub = [];
                        count = 0;
                    }
                }
                return new_board;
    }

    function convertMove(move){
        var value=[]
        if (move.indexOf("setup")!==-1){
            return move
        }
        move=move.split(",")
        for (var e=0; e<move.length; e++){
            var split = move[e].split(' ');
            var space = split[0];
            var direction = split[1];
            console.log(space, typeof(+space));
            if (typeof(+space) !== 'number') {
                space = space.slice(1);
            }
            var row = 8-parseInt(space.split("-")[0])
            var column = String.fromCharCode(65+parseInt(space.split("-")[1]));
            console.log(row, column);
            var piece = document.getElementById(row + '-' + column);
            value.push(" "+column+"-"+row+" "+direction);//direction needs to be flipped
        }
        return value;
    }

    function seed_board() {
        for (var row=0; row<gameboard.length; row++) {
            for (var space=0; space<gameboard[row].length; space++) {
                var location = document.getElementById(row.toString() + "-" + space.toString());
                seed_space(location);
            }
        }
    }

    function playMove(){
        var move=currentMove? parseInt(currentMove.split("-")[1])+1: null;
        if (move>=moves.length){
            return;
        }
        else if (!move){
            currentMove="move-0";
            document.getElementById(currentMove).classList.add("selected-move")
            gameboard=convertBoard(boards[0].split(","));
            seed_board();
            return;
        }
        else if (moves[move].indexOf("setup")!==-1){
            document.getElementById(currentMove).classList.remove("selected-move")
            currentMove="move-"+move;
            document.getElementById(currentMove).classList.add("selected-move")
            gameboard=convertBoard(boards[move].split(","));
            seed_board();
            return;
        }
        var steps=moves[move].split(",");
        var e=0;
        var g=0;
        var playInterval=setInterval(function(){
            g+=1;
            if (g>3){
                clearInterval(playInterval);
            }
            var step=steps[e];
            step=step.split(" ");
            var space=step[0]
            var direction=step[1];
            var adjacents=find_adjacent(document.getElementById(space))
            space=space.split("-");
            var piece=gameboard[space[0]][space[1]]
            gameboard[space[0]][space[1]]='';
            seed_space(document.getElementById(space.join("-")))
            for (var f=0; f<adjacents.length; f++){
                var adj=adjacents[f].split("-")
                if (trap_check(document.getElementById(adjacents[f]))){
                    gameboard[adj[0]][adj[1]]='';
                    seed_space(document.getElementById(adj[0]+"-"+adj[1]))
                    break;
                }
            }
            switch(direction){
                case 'north':{
                    gameboard[parseInt(space[0])-1][space[1]]=piece
                    seed_space(document.getElementById((parseInt(space[0])-1).toString()+"-"+space[1].toString()))
                    break;
                }
                case 'south':{
                    gameboard[parseInt(space[0])+1][space[1]]=piece
                    seed_space(document.getElementById((parseInt(space[0])+1).toString()+"-"+space[1].toString()))
                    break
                }
                case 'east':{
                    gameboard[space[0]][parseInt(space[1])+1]=piece
                    seed_space(document.getElementById(space[0].toString()+"-"+(parseInt(space[1])+1).toString()))
                    break;
                }
                case 'west':{
                    gameboard[space[0]][parseInt(space[1])-1]=piece
                    seed_space(document.getElementById(space[0].toString()+"-"+(parseInt(space[1])-1).toString()))
                    break;
                }
                default:
                    throw new Error("No direction.")
            }
            e+=1;
            if (e>=steps.length){
                clearInterval(playInterval);
                document.getElementById(currentMove).classList.remove("selected-move")
                currentMove="move-"+move;
                document.getElementById(currentMove).classList.add("selected-move")
                if (gameboard.toString()!==convertBoard(boards[move].split(",")).toString()){
                    gameboard=convertBoard(boards[move].split(","));
                    seed_board();
                    throw new Error("Warning: board not matching!")
                }
            }
            }, 500)
    }
    
	var params=window.location.pathname.split("/")
    $('#game-no').text(params[params.length-1]) 
	$.get("/api/games/"+params[params.length-1], function(response){
		moves=response.moves;
		boards=response.board
		createBoard();
		createTable();

	})
})