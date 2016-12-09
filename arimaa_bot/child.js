var child_process=require("child_process");

child_process.exec("python shell_for_bot.py silver r,r,r,r,r,r,r,r,d,c,h,m,e,h,c,d,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,R,H,C,M,E,C,H,R,R,R,R,D,D,R,R,R", function(error, stdout, stderr){
	console.log(error, stdout, stderr);
});

