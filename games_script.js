'use strict';

function createList(){
	$.get("/api/users/1", function(response){
		var listElement=response.games.sort(function(a, b){
			return b.id - a.id
		}).map(function(game){
			var time=new Date(game.time)
			return "<a class='games-link centered' href='/games/"+game.id+
			"'><h2>Game # "+game.id+"</h2><p>"+"<label>Winner:</label> "+(game.winner?game.winner.slice(0, 1).toUpperCase()+game.winner.slice(1):"none")+"<br /><label>Moves:</label> "+game.moves+"<br />"+
			convertTime(time)+"</p><img src='/pictures/board.jpeg'/></a>"
		}).join("\n");
		$("#games-list").html(listElement)
	})
}

function convertTime(time){
	var timeFormat=time.toLocaleTimeString().split(":")
	timeFormat[2]=timeFormat[2].split(" ")[1]
	timeFormat=timeFormat[0]+":"+timeFormat[1]+" "+timeFormat[2]
	return "<label>Date:</label> "+time.toLocaleDateString()+"<br />"+" at "+timeFormat
}

$('document').ready(function(){
	createList();
})