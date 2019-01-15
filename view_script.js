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
    		table+="<tr><td>"+moves[y]+"</td></tr>"
    	}
    	document.getElementById("view-moves").innerHTML=table;
    }
    
	var params=window.location.pathname.split("/")
	$.get("/api/games/"+params[params.length-1], function(response){
		moves=response.moves;
		boards=response.board
		createBoard();
		createTable();
	})
})