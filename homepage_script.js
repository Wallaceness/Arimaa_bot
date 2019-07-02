
window.onload=function(){

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
        document.getElementById('board').innerHTML = (board);
    }

    createBoard();

    document.getElementById("new-game").onclick=function(){
        $.post("/api/new", {}, function(response){
            window.location="/games/"+response.id;
        })
    }
}
