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
    console.log(document.getElementById('view-board'))
    document.getElementById('view-board').innerHTML = (board);
	}

    function createTable(){
    	var table=""
    	for (var y=0; y<moves.length; y++){
    		table+="<tr><td id='move-"+y+"'>"+moves[y]+"</td></tr>"
    	}
    	document.getElementById("view-moves").innerHTML=table;
        for (var b = 0; b < moves.length; b++) {
            var Id = "move-"+b
            document.getElementById(Id).onclick = function() {
                setMove(b)
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
        space.style.border = "5px solid black";
        var id = space.id;
        // if (trap_check(space) === true) {
        //     var record = [id, gameboard[id[0]][id[2]]];
        //     space.style.backgroundImage = 'none';
        //     space.style.opacity = 1;
        //     gameboard[id[0]][id[2]] = '';
        //     return record
        // }
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
            space.style.border = "5px solid silver";
        }
        if (pieces.gold.indexOf(board) !== -1) {
            space.style.border = "5px solid gold";
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

    function seed_board() {
        for (var row=0; row<gameboard.length; row++) {
            for (var space=0; space<gameboard[row].length; space++) {
                var location = document.getElementById(row.toString() + "-" + space.toString());
                seed_space(location);
            }
        }
    }
    
	var params=window.location.pathname.split("/")
	$.get("/api/games/"+params[params.length-1], function(response){
		moves=response.moves;
		boards=response.board
		createBoard();
		createTable();

	})
})