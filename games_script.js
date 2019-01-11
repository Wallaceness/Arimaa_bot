'use strict';

console.log("FUCK YOU YOU STUPID GAME SCRIPT!")

function createList(){
	$.get("/api/users/1", function(response){
		var listElement=response.games.sort(function(a, b){
			return b.id - a.id
		}).map(function(game){
			return "<a href='/games/"+game.id+"'>"+game.id+"</a>"
		}).join("\n");
		$("#games-list").html(listElement)
	})
}

$('document').ready(function(){
	createList();
})