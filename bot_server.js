var child_process=require("child_process");
var express=require("express");
var bodyparser=require('body-parser');
var app=express();

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(__dirname));

var port= app.listen(process.env.PORT || 8080);
app.listen(port, function(){
	console.log("Ready to Play!");
})

app.get('/', function(request, response, next){
	console.log("get received!");
	response.sendFile(__dirname+'/board.html');
})

app.post('/', function(request, response, next){
	console.log("post received!");
	var color=request.body.color;
	var board=request.body.board;
	var setup=request.body.setup;
	child_process.exec("python ./arimaa_bot/shell_for_bot.py "+color+" "+board+" "+setup, function(error, stdout, stderr){
		console.log(error, stdout, stderr)
		if (error) response.send(error);
		else{
			if (stderr) response.send(stderr);
			else response.json(stdout);
		}
	})
})