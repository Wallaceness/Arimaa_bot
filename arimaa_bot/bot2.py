 #MY FIRST ATTEMPT AT MAKING AN ARIMAA ENGINE!!!!!!
start_position=[' ',' ',' ',' ',' ',' ',' ',' ',\
                ' ',' ',' ',' ',' ',' ',' ',' ',\
                ' ',' ',' ',' ',' ',' ',' ',' ',\
                ' ',' ',' ',' ',' ',' ',' ',' ',\
                ' ',' ',' ',' ',' ',' ',' ',' ',\
                ' ',' ',' ',' ',' ',' ',' ',' ',\
                ' ',' ',' ',' ',' ',' ',' ',' ',\
                ' ',' ',' ',' ',' ',' ',' ',' ']

gold_setup=['R','R','R','R','R','R','R','R',\
            'C','H','D','M','E','D','H','C',\
            ' ',' ',' ',' ',' ',' ',' ',' ',\
            ' ',' ',' ',' ',' ',' ',' ',' ',\
            ' ',' ',' ',' ',' ',' ',' ',' ',\
            ' ',' ',' ',' ',' ',' ',' ',' ',\
            ' ',' ',' ',' ',' ',' ',' ',' ',\
            ' ',' ',' ',' ',' ',' ',' ',' ']



def bot(color, position, setup=False):
    global Position
    if setup:
        if color=="gold":
            position[0:16]=['R','R','R','R','R','R','R','R',\
                            'C','H','D','M','E','D','H','C']
        elif color=="silver" :
            position[48:]=['c','h','d','m','e','d','h','c',\
                            'r','r','r','r','r','r','r','r']
            #board(position)
        return position[::-1]
    global pieces, enemy_pieces, goal, enemy_goal
    if color=='gold':
        pieces=['R','C','D','H','M','E']
        enemy_pieces=['r','c','d','h','m','e']
        goal=range(56,64)
        enemy_goal=range(0,8)
    if color=='silver':
        pieces=['r','c','d','h','m','e']
        enemy_pieces=['R','C','D','H','M','E']
        goal=range(0,8)
        enemy_goal=range(56,64)
    global a_file
    a_file=[0,8,16,24,32,40,48,56]
    global h_file
    h_file=[7,15,23,31,39,47,55,63]
    global piece_values
    piece_values={'R':1,'r':1,'c':2,'C':2,'d':3,'D':3,'h':5,'H':5,'m':8,'M':8,'E':20,'e':20}
    global traps
    traps=[18,21,42,45]
    steps=4
    location=0
    global possible_moves
    possible_moves={}
    global more_possibilities
    more_possibilities={}
    global enemy_possible_moves
    enemy_possible_moves={}
    global more_enemy_possibilities
    more_enemy_possibilities={}
    global final_move
    final_move=[]
    for number in range(0,64):
        if position[number] in pieces:
            possibilities(position, number, possible_moves)
        if position[number] in enemy_pieces:
            enemy_possibilities(position, number, enemy_possible_moves)
    planner(position, final_move)
    if final_move!=[]:
        submit_move(position, final_move)
        #board(position)
        #return position[::-1]
        return [final_move, position[::-1]]
    for square in position:
        if steps==0:
            break
        if square in pieces:
            location=position.index(square, location)
            if is_frozen(position, location, square)==False:
                if trap_check(position, location, pieces):
                    position[location]=' '
                    location+=1
                    continue
                x=0
                for sp in adjacent(location):
                    if sp in traps:
                        if position[sp] in pieces:
                            for item in adjacent(sp):
                                if position[item] in pieces:
                                    x+=1
                if x==1:
                    location+=1
                    continue
                for space in adjacent(location):
                    if position[space]==' ':
                        if space in traps:
                            y=0
                            for item in adjacent(space):
                                if position[item] in pieces:
                                    y+=1
                            if y==1:
                                continue
                    #if position[location]=='r' or position[location]=="R":
                     #   if color=='gold':
                      #      if space==location-8:
                       #         continue
                        #if color=="silver":
                         #   if space==location+8:
                          #      continue
                        move(position, location, space)
                        final_move.append(str(location)+" "+direction_finder(location, space))
                        steps-=1
                        location+=1
                        if trap_check(position, space, pieces):
                            position[space]=' '
                        break
    #board(position)
    #return position[::-1]
    return [final_move, position[::-1]]



def board(position):
    board='|'+'|'.join(position[0:8])+'|'+"\n"+'|'+'|'.join(position[8:16])+'|'+"\n"+'|'+'|'.join(position[16:24])+'|'+"\n"+'|'+'|'.join(position[24:32])+'|'+"\n"+'|'+'|'.join(position[32:40])+'|'+"\n"+'|'+'|'.join(position[40:48])+'|'+"\n"+'|'+'|'.join(position[48:56])+'|'+"\n"+'|'+'|'.join(position[56:])+'|'
    print board


def submit_move(position, turn):
    traps=[18, 21, 42, 45]
    count=0
    for step in turn:
        L=step[1]
        if step[2].isdigit():
            L=L+step[2]
            direct=step[3:]
        else:
            direct=step[2:]
        L=int(L)
        directory={"north":-8, "south":8, "east":1, "west":-1}
        move(position, L, L+directory[direct])
        if position[L+directory[direct]] in pieces:
            if trap_check(position, L+directory[direct], pieces):
                position[L+directory[direct]]=' '
            for item in adjacent(L):
                if item in traps:
                    if position[item] in pieces:
                        if trap_check(position, item, pieces):
                            position[item]=' '
                    if position[item] in enemy_pieces:
                        if trap_check(position, item, enemy_pieces):
                            position[item]=' '
        if position[L+directory[direct]] in enemy_pieces:
            if trap_check(position, L+directory[direct], enemy_pieces):
                position[L+directory[direct]]=' '
            for item in adjacent(L):
                if item in traps:
                    if position[item] in pieces:
                        if trap_check(position, item, pieces):
                            position[item]=' '
                    if position[item] in enemy_pieces:
                        if trap_check(position, item, enemy_pieces):
                            position[item]=' '
        turn[count]=str(L)+" "+direct
        count+=1


def is_frozen(position, location, piece):
    adjacents=adjacent(location)
    if piece in pieces:
        for space in adjacents:
            if position[space] in pieces:
                return False
        for space in adjacents:
            if position[space] in enemy_pieces and piece_values[position[space]]>piece_values[piece]:
                return True
        return False
    if piece in enemy_pieces:
        for space in adjacents:
            if position[space] in enemy_pieces:
                return False
        for space in adjacents:
            if position[space] in pieces and piece_values[position[space]]>piece_values[piece]:
                return True
        return False


def adjacent(location):
    adjacents=[location-8, location+1, location+8, location-1]
    if location in range(0,8):
        adjacents.remove(location-8)
    if location in range(56,64):
        adjacents.remove(location+8)
    if location in a_file:
        adjacents.remove(location-1)
    if location in h_file:
        adjacents.remove(location+1)
    return adjacents


def setup(position, color, setup):
    if color=="gold":
        position[0:16]=setup
    if color=="silver":
        position[48:64]=setup
    board(position)


def move(position, location, destination):
    position[destination]=position[location]
    position[location]=' '


def push(position, location, destination, push_destination):
    position[push_destination]=position[destination]
    position[destination]=position[location]
    position[location]=' '


def pull(position, location, destination, enemy_location):
    position[destination]=position[location]
    position[location]=position[enemy_location]
    position[enemy_location]=' '


def trap_check(position, location, database):
    if location in traps:
        if database==pieces:
            for space in adjacent(location):
                if position[space] in pieces:
                    return False
            else:
                return True
        if database==enemy_pieces:
            for space in adjacent(location):
                if position[space] in enemy_pieces:
                    return False
            else:
                return True
    return False



def possibilities(position, location, dictionary):
    piece=position[location]
    entry=piece+str(location)
    dictionary[entry]=[[],[],[],[]]
    more_possibilities[entry]=[[],[],[],[]]
    current=[location]
    count=0
    position[location]=' '
    while count<4:
        for loc in current:
            if count>0:
                if is_frozen(position, loc, piece)==True:
                    more_possibilities[entry][count].append(loc)
                    continue
                if trap_check(position, loc, pieces)==True:
                    more_possibilities[entry][count].append(loc)
                    continue
            if is_frozen(position, loc, piece)==False and trap_check(position, loc, pieces)==False:
                for space in adjacent(loc):
                    if position[space] in enemy_pieces:
                        if count==3:
                            continue
                        if piece_values[position[space]]<piece_values[piece]:
                            for square in adjacent(space):
                                if position[square]==' ':
                                    if square==loc:
                                        continue
                                    if space not in dictionary[entry][count+1]:
                                        dictionary[entry][count+1].append(space)
                                        break
                    if position[space]==' ':
                        if position[loc] in enemy_pieces or position[loc] in pieces:
                            x=0
                            for a in adjacent(loc):
                                if position[a]==' ':
                                    x+=1
                            if x>2:
                                dictionary[entry][count].append(space)
                            if x==2:
                                if count==3:
                                    continue
                                for square in adjacent(space):
                                    if position[square]==' ':
                                        if space not in dictionary[entry][count+1]:
                                            dictionary[entry][count+1].append(space)
                                            break
                        else:
                            if space not in dictionary[entry][count]:
                                dictionary[entry][count].append(space)
                                continue
                    if position[space] in pieces:
                        if count==3:
                            continue
                        for square in adjacent(space):
                            if square==loc:
                                continue
                            if position[square]==' ':
                                if space not in dictionary[entry][count+1]:
                                    dictionary[entry][count+1].append(space)
                        for square in adjacent(space):
                            if position[square] in enemy_pieces:
                                if count==2:
                                    break
                                if piece_values[position[space]]>piece_values[position[square]]:
                                    for sq in adjacent(square):
                                        if position[square]==' ':
                                            if space not in dictionary[entry][count+2]:
                                                dictionary[entry][count+2].append(space) 
            if piece=='r' and loc+8 in dictionary[entry][count]:
                dictionary[entry][count].remove(loc+8)
            if piece=='R' and loc-8 in dictionary[entry][count]:
                dictionary[entry][count].remove(loc-8)
        current=dictionary[entry][count]
        count+=1
    position[location]=piece


def possibilities2(position, dictionary):
    possibilities2={}
    for entry in dictionary:
        for step in dictionary[entry]:
            for item in step:
                if is_frozen(position, item, position[item])==True:
                    count=0
                    while count<3:
                        for location in adjacent(item):
                            for ent in possible_moves:
                                if ent !=entry:
                                    if location in possible_moves[ent][count]:
                                        move(position, int(ent[1:]), location)
                                        move(position, int(entry[1:]), item)
                                        possibilities(position, item, possibilities2)
                                        break
                        count+=1
                if trap_check(position, item, pieces)==True:
                    count=0
                    while count<3:
                        for location in adjacent(item):
                            for ent in possible_moves:
                                if ent !=entry:
                                    if location in possible_moves[ent][count]:
                                        move(position, int(ent[1:]), location)
                                        move(position, int(entry[1:]), item)
                                        possibilities(position, item, possibilities2)
                                        move(position, location, int(ent[1:]))
                                        move(position, item, int(entry[1:]))
                                        break
                        count+=1
    return possibilities2
                                                


def enemy_possibilities(position, location, dictionary):
    piece=position[location]
    entry=piece+str(location)
    dictionary[entry]=[[],[],[],[]]
    current=[location]
    count=0
    position[location]=' '
    while count<4:
        for loc in current:
            if is_frozen(position, loc, piece)==False and trap_check(position, loc, enemy_pieces)==False:
                for space in adjacent(loc):
                    if position[space] in pieces:
                        if count==3:
                            continue
                        if piece_values[position[space]]<piece_values[piece]:
                            for square in adjacent(space):
                                if position[square]==' ':
                                    if square==loc:
                                        continue
                                    if space not in dictionary[entry][count+1]:
                                        dictionary[entry][count+1].append(space)
                                        break
                    if position[space]==' ':
                        if position[loc] in pieces or position[loc] in enemy_pieces:
                            x=0
                            for a in adjacent(loc):
                                if position[a]==' ':
                                    x+=1
                            if x>2:
                                dictionary[entry][count].append(space)
                            if x==2:
                                if count==3:
                                    continue
                                for square in adjacent(space):
                                    if position[square]==' ':
                                        if space not in dictionary[entry][count+1]:
                                            dictionary[entry][count+1].append(space)
                                            break
                        else:
                            if space not in dictionary[entry][count]:
                                dictionary[entry][count].append(space)
                                continue
                    if position[space] in enemy_pieces:
                        if count==3:
                            continue
                        for square in adjacent(space):
                            if square==loc:
                                continue
                            if position[square]==' ':
                                if space not in dictionary[entry][count+1]:
                                    dictionary[entry][count+1].append(space)
                        for square in adjacent(space):
                            if position[square] in pieces:
                                if count==2:
                                    break
                                if piece_values[position[space]]>piece_values[position[square]]:
                                    for sq in adjacent(square):
                                        if position[square]==' ':
                                            if space not in dictionary[entry][count+2]:
                                                dictionary[entry][count+2].append(space) 
            if piece=='r' and loc+8 in enemy_possible_moves[entry][count]:
                dictionary[entry][count].remove(loc+8)
            if piece=='R' and loc-8 in dictionary[entry][count]:
                dictionary[entry][count].remove(loc-8)
        current=dictionary[entry][count]
        count+=1
    position[location]=piece

     

def direction_finder(location, destination):
    if destination==location+1:
        return "east"
    if destination==location-1:
        return "west"
    if destination==location+8:
        return "south"
    if destination==location-8:
        return "north"


def loop(path, number):
    for m in path[-number]:
        for item in adjacent(m):
            if item in path[-number-1]:
                    path[-number]=[m]
                    path[-number-1]=[item]
                    return True

def plot_move(location, destination, entry, position, push=None, pull=None):
    push1, move1, move2=None, None, None
    path=[]
    path.append([location])
    count=0
    if int(entry[1:])!=location:
        for item in possible_moves[entry]:
            if location in item:
                count=possible_moves[entry].index(item)+1
                break
    for step in possible_moves[entry][count:]:
        if destination in step:
            path.append([destination])
            break
        else:
            path.append(step)
    x=[]
    for move in path[-2]:
        if move in adjacent(destination):
            x.append(move)
    path[-2]=x
    if push:
        for step in path:
            for square in step:
                if square==push:
                    step.remove(square)
        if len(path)>2:
            path.remove(path[-2])
    number=1
    while number<len(path):
        if path[-number]==[]:
            path.remove(path[-number])
        if loop(path, number):
            number+=1
        else:
            if number==len(path):
                break
            path.remove(path[-number-1])
    if push or pull:
        area=path[1:-1]
    else:
        area=path[1:]
    for item in area:
        if position[item[0]] in enemy_pieces:
            locator=path.index(item)-1
            for sp in adjacent(item[0]):
                if position[sp]==' ' and [sp] not in path:
                    push1=position[item[0]]+str(item[0])+direction_finder(item[0], sp)
                    break
        if position[item[0]] in pieces:
            locator=path.index(item)-1
            for space in adjacent(item[0]):
                if position[space]==' ' and [space] not in path:
                    move1=position[item[0]]+str(item[0])+direction_finder(item[0], space)
                    break
            else:
                for space in adjacent(item[0]):
                    if position[space]==' ':
                        move1=position[item[0]]+str(item[0])+direction_finder(item[0], space)
                        space=space
                        break
                for sp in adjacent(space):
                    if position[sp]==' ':
                        move2=position[item[0]]+str(space)+direction_finder(space, sp)
                        break                 
    if push:
        Push=position[destination]+str(destination)+direction_finder(destination, push)
    if pull:
        Pull=position[pull]+str(pull)+direction_finder(pull, location)
    for element in path[:-1]:
        pos=path.index(element)
        path[pos]=entry[0]+str(element[0])+direction_finder(element[0], path[pos+1][0])
    if move1:
        path.insert(locator, move1)
    if move2:
        path.insert(locator+1, move2)
    if push:
        path.insert(-2, Push)
    if push1:
        path.insert(locator, push1)
    if pull:
        path.insert(-1, Pull)
    path.pop()
    return path


def plot_enemy_move(location, destination, entry, position, push=None, pull=None):
    push1, move1, move2=None, None, None
    path=[]
    path.append([location])
    for step in enemy_possible_moves[entry]:
        if destination in step:
            path.append([destination])
            break
        else:
            path.append(step)
    x=[]
    for move in path[-2]:
        if move in adjacent(destination):
            x.append(move)
    path[-2]=x
    if push:
        for step in path:
            for square in step:
                if square==push:
                    step.remove(square)
        if len(path)>2:
            path.remove(path[-2])
    number=1
    while number<len(path):
        if path[-number]==[]:
            path.remove(path[-number])
        if loop(path, number):
            number+=1
        else:
            if number==len(path):
                break
            path.remove(path[-number-1])
    if push or pull:
        area=path[1:-1]
    else:
        area=path[1:]
    for item in area:
        if position[item[0]] in pieces:
            locator=path.index(item)-1
            for sp in adjacent(item[0]):
                if position[sp]==' ' and sp!=path[path.index(item)+1][0]:
                    push1=position[item[0]]+str(item[0])+direction_finder(item[0], sp)
                    break
        if position[item[0]] in enemy_pieces:
                    locator=path.index(item)-1
                    for space in adjacent(item[0]):
                        if position[space]==' ' and [space] not in path:
                            move1=position[item[0]]+str(item[0])+direction_finder(item[0], space)
                            break
                    else:
                        for space in adjacent(item[0]):
                            if position[space]==' ':
                                move1=position[item[0]]+str(item[0])+direction_finder(item[0], space)
                                space=space
                                break
                        for sp in adjacent(space):
                            if position[sp]==' ':
                                move2=position[item[0]]+str(space)+direction_finder(space, sp)
                                break 
    if push:
        Push=position[destination]+str(destination)+direction_finder(destination, push)
    if pull:
        Pull=position[pull]+str(pull)+direction_finder(pull, location)
    for element in path[:-1]:
        pos=path.index(element)
        path[pos]=entry[0]+str(element[0])+direction_finder(element[0], path[pos+1][0])
    if move1:
        path.insert(locator, move1)
    if move2:
        path.insert(locator+1, move2)
    if push:
        path.insert(-2, Push)
    if push1:
        path.insert(locator, push1)
    if pull:
        path.insert(-1, Pull)
    path.pop()
    return path


def copy_position(position):
    copy=start_position
    for number in range(0, 64):
        copy[number]=position[number]
    return copy


def planner(position, final_move):
    if goal_search(position, final_move):
        return
    enemy_goal_search(position, final_move)
    on_targets, off_targets, targets2, on_threats, off_threats, threats2=capture_search(position)
    if len(final_move)<4:
        on_trap_captures(position, final_move, on_targets, 4-len(final_move))
    if len(final_move)==0:
        off_trap_captures(position, final_move, off_targets)
    if len(final_move)==0:
        two_trap_captures(position, final_move, targets2)
    if len(final_move)<4:
        on_trap_defense(position, final_move, on_threats, 4-len(final_move))
    if len(final_move)<4:
        off_trap_defense(position, final_move, off_threats, 4-len(final_move))
    if len(final_move)<4:
        two_trap_defense(position, final_move, threats2, 4-len(final_move))
    return



def goal_search(position, final_move):
    for entry in possible_moves:
        if entry[0]=='r' or entry[0]=='R':
            for step in possible_moves[entry]:
                for move_ in step:
                    if move_ in goal:
                        final_move+=plot_move(int(entry[1:]), move_, entry, position)
                        return True

def enemy_goal_search(position, final_move):
    for entry in enemy_possible_moves:
        if entry[0]=='r' or entry[0]=='R':
            for step in enemy_possible_moves[entry]:
                for move_ in step:
                    if move_ in enemy_goal:
                        path=plot_enemy_move(int(entry[1:]), move_, entry, position)
                        for item in path[1:]:
                            space=item[1]
                            if item[2].isdigit():
                                space+=item[2]
                            space=int(space)
                            for entry in possible_moves:
                                for step in possible_moves[entry]:
                                    if space in step:
                                        final_move+=plot_move(int(entry[1:]), space, entry, position)
                                        return True

def capture_search(position):
    on_targets=[]
    off_targets=[]
    targets2=[]
    on_threats=[]
    off_threats=[]
    threats2=[]
    for trap in traps:
        number=0
        number2=0
        targs=[]
        thr=[]
        for space in adjacent(trap):
            if position[space] in enemy_pieces:
                number+=1
                targs.append(space)
            if position[space] in pieces:
                number2+=1
                thr.append(space)
        if number==1:
            on_targets=on_targets+targs
        if number2==1:
            on_threats=on_threats+thr
        if number==2:
            x=0
            taken=''
            for targ in targs:
                for item in adjacent(targ):
                    if position[item] in pieces and piece_values[position[item]]>piece_values[position[targ]]:
                        if is_frozen(position, item, position[item])==False and item!=taken:
                            x+=1
                            taken=item
                            break
            if x==2:
                targets2.append(targs)
        if number2==2:
            x=0
            taken=0
            for threat in thr:
                for item in adjacent(threat):
                    if position[item] in enemy_pieces and piece_values[position[item]]>piece_values[position[threat]]:
                        if is_frozen(position, item, position[item])==False and item!=taken:
                            x+=1
                            taken=item
                            break
            if x==2:
                threats2.append(thr)
        if number==0:
            targs2=[trap-2, trap+2, trap+16, trap-16, trap+7, trap+9, trap-7, trap-9]
            x=0
            while x<len(targs2):
                if position[targs2[x]] in enemy_pieces:
                    x+=1
                    if x==len(targs2):
                        break
                if position[targs2[x]] not in enemy_pieces:
                    targs2.remove(targs2[x])
            off_targets=off_targets+targs2
        if number2==0:
            thr2=[trap-2, trap+2, trap+16, trap-16, trap+7, trap+9, trap-7, trap-9]
            x=0
            while x<len(thr2):
                if position[thr2[x]] in pieces:
                    x+=1
                    if x==len(thr2):
                        break
                if position[thr2[x]] not in pieces:
                    thr2.remove(thr2[x])
            off_threats=off_threats+thr2
    return on_targets, off_targets, targets2, on_threats, off_threats, threats2

def on_trap_captures(position, final_move, on_targets, moves):
    for target in on_targets:
        for square in adjacent(target):
            if square in traps:
                tr=square
                break
        if position[tr]==' ':
            for entry in possible_moves:
                if piece_values[entry[0]]> piece_values[position[target]]:
                    for step in possible_moves[entry][:moves]:
                        if target in step:
                                final_move+=plot_move(int(entry[1:]), target, entry, position, tr)
                                return
                    if moves>=3:
                        for step in possible_moves[entry][:moves-2]:
                            if tr in step:
                                for pos in adjacent(tr):
                                    if position[pos] in pieces and pos!=int(entry[1:]):
                                        for x in adjacent(tr):
                                            if position[x]==' ' or x==int(entry[1:]):
                                                dest=x
                                                break
                                        final_move+=plot_move(int(entry[1:]), tr, entry, position)
                                        final_move+=plot_move(tr, dest, entry, position, None, target)
                                        return True
        if position[tr] in enemy_pieces:
            for entry in possible_moves:
                if piece_values[entry[0]]> piece_values[position[target]]:
                    for step in possible_moves[entry][:moves]:
                        if target in step:
                            a=0
                            for place in adjacent(target):
                                if position[place]==' ':
                                    a+=1
                                    s=place
                                if a>1:
                                    final_move+=plot_move(int(entry[1:]), target, entry, position, s)
                                    return
                    if moves>=3:
                        for step in possible_moves[entry][:moves-2]:
                            for place in adjacent(target):
                                if place==int(entry[1:]):
                                    dest=int(entry[1:])
                                    break
                                if position[place]==' ':
                                    dest=place
                                    break
                            if dest in step and dest!=int(entry[1:]):
                                final_move+=plot_move(int(entry[1:]), dest, entry, position)
                            for local in adjacent(dest):
                                if position[local]==' ' or local==int(entry[1:]):
                                    d=local
                            if is_frozen(position, dest, position[dest])==False:
                                final_move+=plot_move(dest, d, entry, position, None, target)
                                return
                                
def off_trap_captures(position, final_move, off_targets):
    if off_targets!=[]:
        for targ in off_targets:
            for trap in traps:
                if targ in [trap-2, trap+2, trap+16, trap-16, trap+7, trap+9, trap-7, trap-9]:
                    tr=trap
            if position[tr]==' ':
                possibles=[]
                for square in adjacent(targ):
                    if position[square] in pieces and piece_values[position[square]]>piece_values[position[targ]]:
                        possibles.append(square)
                for pos in possibles:
                    entry=position[pos]+str(pos)
                    if is_frozen(position, pos, position[pos])==False:
                        if pos in adjacent(tr):
                            for x in adjacent(pos):
                                if x!=tr and position[x]==' ':
                                    final_move+=plot_move(pos, x, entry, position, None, targ)
                                    if is_frozen(position, x, position[pos])==False:
                                        final_move+=plot_move(x, pos, entry, position, tr)
                                        return True
                            else:
                                a=0
                                b=None
                                for item in adjacent(tr):
                                    if position[item] in pieces and item!=pos:
                                        a+=1
                                    if position[item]==' ':
                                        b=item
                                if a>0 and b!=None:
                                    final_move+=plot_move(pos, tr, entry, position, None, targ)
                                    final_move+=plot_move(tr, b, entry, position, None, pos)
                        if pos not in adjacent(tr):
                            for y in adjacent(targ):
                                if y in adjacent(tr) and position[y]==' ':
                                    final_move+=plot_move(pos, targ, entry, position, y)
                                    if is_frozen(position, pos, position[pos])==False:
                                        final_move+=plot_move(targ, y, entry, position, tr)
                                        return True

def two_trap_captures(position, final_move, targets2):
    highest=''
    for duo in targets2:
        for piece in duo:
            if highest=='':
                highest=piece
                continue
            if piece_values[position[piece]]>piece_values[position[highest]]:
                highest=piece
    for pair in targets2:
        if highest in pair:
            for item in pair:
                for space in adjacent(item):
                    if space in traps:
                        tr=space
                        break
                if position[tr]==' ':
                    for entry in possible_moves:
                        available=None
                        for loc in adjacent(int(entry[1:])):
                            if loc==' ':
                                available=loc
                        for step in possible_moves[entry][:2]:
                            if item in step or available!=None:
                                if item==highest:
                                    final_move+=plot_move(int(entry[1:]), item, entry, position, tr)
                                if item!=highest:
                                    for sp in adjacent(item):
                                        if sp!=tr and position[sp]==' ':
                                            final_move+=plot_move(int(entry[1:]), item, entry, position, sp)
                                            break
                                    else:
                                        for place in adjacent(int(entry[1:])):
                                            if position[place]==' ':
                                                final_move+=plot_move(int(entry[1:]), place, entry, position, None, item)
                                if len(final_move)==4:
                                    return
                if position[tr] in enemy_pieces:
                    for entry in possible_moves:
                        available=None
                        for loc in adjacent(int(entry[1:])):
                            if position[loc]==' ':
                                available=loc
                        for step in possible_moves[entry][:2]:
                            if item in step:
                                for square in adjacent(item):
                                    if square!=tr and position[square]==' ':
                                        final_move+=plot_move(int(entry[1:]), item, entry, position, square)
                                        break
                            else:
                                if int(entry[1:]) in adjacent(item) and piece_values[position[int(entry[1:])]]>piece_values[position[item]]:
                                    if available!=None:
                                        final_move+=plot_move(int(entry[1:]), available, entry, position, None, item)
                            if len(final_move)==4:
                                    return


def on_trap_defense(position, final_move, on_threats, moves):
    for threat in on_threats:
        for square in adjacent(threat):
            if square in traps:
                tr=square
                break
        for entry in enemy_possible_moves:
            if piece_values[entry[0]]> piece_values[position[threat]]:
                for step in enemy_possible_moves[entry]:
                    if threat in step:
                        count=0
                        while count<moves-1:
                            for location in adjacent(tr):
                                for item in possible_moves:
                                    if int(item[1:])!=threat:
                                        if location in possible_moves[item][count]:
                                            final_move+=plot_move(int(item[1:]), location, item, position)
                                            return
                            count+=1
                        else:
                            if position[tr] not in pieces:
                                if is_frozen(position, threat, position[threat])==False:
                                    for space in adjacent(threat):
                                        if position[space]==' ' and space not in traps:
                                            final_move+=plot_move(threat, space, position[threat]+str(threat), position)
                                            return
                for step in enemy_possible_moves[entry][:2]:
                    if tr in step:
                        for pos in adjacent(tr):
                            if position[pos] in enemy_pieces and pos!=int(entry[1:]):
                                count=0
                                while count<moves-1:
                                    for location in adjacent(tr):
                                        for item in possible_moves:
                                            if int(item[1:])!=threat:
                                                if location in possible_moves[item][count]:
                                                    final_move+=plot_move(int(item[1:]), location, item, position)
                                                    return
                                    count+=1
                                else:
                                    if position[tr] not in pieces:
                                        if is_frozen(position, threat, position[threat])==False:
                                            for space in adjacent(threat):
                                                if position[space]==' ' and space not in traps:
                                                    final_move+=plot_move(threat, space, position[threat]+str(threat), position)
                                                    return True

def off_trap_defense(position, final_move, off_threats, moves):
    if off_threats!=[]:
        for threat in off_threats:
            for trap in traps:
                if threat in [trap-2, trap+2, trap+16, trap-16, trap+7, trap+9, trap-7, trap-9]:
                    tr=trap
            if position[tr]==' ':
                possibles=[]
                for square in adjacent(threat):
                    if position[square] in enemy_pieces and piece_values[position[square]]>piece_values[position[threat]]:
                        possibles.append(square)
                if possibles!=[]:
                    x=0
                    count=0
                    available=moves
                    taken=[]
                    path=[]
                    while x<2 and available>count:
                        for location in adjacent(tr):
                            if location not in taken:
                                for item in possible_moves:
                                    if item not in taken:
                                        if location in possible_moves[item][count]:
                                            path+=plot_move(int(item[1:]), location, item, position)
                                            x+=1
                                            taken.append(location)
                                            taken.append(item)
                                            available-=count+1
                                            break
                        count+=1
                        if count==4:
                            break
                    if x==2:
                        final_move+=path
                        return
                    else:
                        if is_frozen(position, threat, position[threat])==False:
                            for space in adjacent(threat):
                                if position[space]==' ' and space not in traps:
                                    final_move+=plot_move(threat, space, position[threat]+str(threat), position)
                                    return True

def two_trap_defense(position, final_move, threats2, moves):
    for duo in threats2:
        for single in duo:
            for square in adjacent(single):
                if square in traps:
                    tr=square
                    break
            count=0
            while count<moves-1:
                for location in adjacent(tr):
                    for item in possible_moves:
                        if int(item[1:]) not in duo:
                            if location in possible_moves[item][count]:
                                final_move+=plot_move(int(item[1:]), location, item, position)
                                return
                count+=1
