'use strict';

function createList(){
	$.get("/api/users/1", function(response){
		var listElement=response.games.sort(function(a, b){
			return b.id - a.id
		}).map(function(game){
			var time=new Date(game.time)
			return "<a class='games-link centered' href='/games/"+game.id+
			"'><h2>Game # "+game.id+"</h2><p>"+convertTime(time)+"<br /><span><strong>Winner:</strong> "+(game.winner?game.winner.slice(0, 1).toUpperCase()+game.winner.slice(1)+" ":"None ")+"</span><br /><span><strong>Moves:</strong> "+game.moves+
			"</span></p><img src='/pictures/board.jpeg'/></a>"
		}).join("\n");
		$("#games-list").html(listElement)
	})
}

function convertTime(time){
	var timeFormat=time.toLocaleTimeString().split(":")
	timeFormat[2]=timeFormat[2].split(" ")[1]
	timeFormat=timeFormat[0]+":"+timeFormat[1]+" "+timeFormat[2]+" "
	return "<span><strong>Date:</strong> "+time.toLocaleDateString()+"</span><br /><span>at "+timeFormat+"</span>"
}

$('document').ready(function(){
	createList();
})