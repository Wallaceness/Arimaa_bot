'use strict';

function createList(){
	$.get("/api/users/1", function(response){
		var listElement=response.games.sort(function(a, b){
			return b.id - a.id
		}).map(function(game){
			return "<a class='games-link centered' href='/games/"+game.id+
			"'><h2>Game # "+game.id+"</h2><p>Winner: "+game.winner+"<br />Moves: "+game.moves+
			"</p><img src='/pictures/board.jpeg'/></a>"
		}).join("\n");
		$("#games-list").html(listElement)
	})
}

$('document').ready(function(){
	createList();
})