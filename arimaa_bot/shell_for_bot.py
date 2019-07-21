import sys
import bot2
import pdb

color=sys.argv[1]
board=sys.argv[2].split(',')
board=board[::-1]
setup=False
if sys.argv[3]=='true':
	setup=True

for number in range(0, 64):
	if board[number]=='':
		board[number]=' '
#print board
# pdb.run(bot2.bot(color, board, setup))
print bot2.bot(color, board, setup)