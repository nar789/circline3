//0-1. header
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


//0-2. router
app.get('/',function(req,res) {
  res.send('hi');
});

app.get('/start',function(req,res){
  res.sendFile(__dirname + '/client.html');
});


//1. enetry point
http.listen(3001,function(){
  init();
  console.log('socket listen on *:3001');
});

//2. static-variable///////////
function Handle(){
	var g;
}
var h=new Handle();
///////////////////////////////

//3. init func
function init(){
	h.g=new Game();
	h.g.users=[];
	h.g.score=[];
	h.g.session=[];
	h.g.curNum=0;
	h.g.lastNum=0;
	console.log(h.g);
}

//4. Model register
function User(){
	var id;
	var ready;
	var type;
	var clientid;
}
function Game(){
	var users=[];
	var score=[];
	var session=[];
	var curNum=0;
	var lastNum=0;
}


//5. game logic for server
io.on('connection',(client)=>{

	client.on('init',()=>{
		console.log('#init');
		init();
		io.emit('B-init');
	});

	client.on('login',(nick)=>{
		console.log('#login : '+nick);
		h.g.users.push(new User());
		h.g.lastNum=h.g.lastNum+1;
		var i=h.g.users.length-1;
		h.g.session[client.id]=i;
		h.g.users[i].clientid=client.id;
		h.g.users[i].id=nick;
		h.g.users[i].ready='unready';
		if(i==0)
			h.g.users[i].type='master';
		else
			h.g.users[i].type='normal';
		h.g.score.push(-1);
		console.log(h.g);
	});

	client.on('ready',(state)=>{
		console.log('#ready');
		var i=h.g.session[client.id];
		h.g.users[i].ready=state;
		console.log(h.g);

		var len=h.g.users.length;
		for(var i=0;i<len;i++){
			if(h.g.users[i].ready==='unready')return;
		}
		io.to(h.g.users[0].clientid).emit('all-ready');
	});

	client.on('B-start',()=>{
		console.log('#B-start');
		h.g.curNum=1;
		io.emit('B-start',h.g.lastNum);
	});

	client.on('pick',(num)=>{
		console.log('#pick : '+num);
		
		if(num!=h.g.curNum || h.g.score[num]!=-1 || num==h.g.lastNum){
			io.emit('B-gameover',{g:h.g.session,id:client.id});
			console.log('gameOver!!!!');
		}else{
			var i=h.g.session[client.id];
			h.g.score[num-1]=i;
			io.emit('B-score',h.g);
		}
		console.log(h.g);
	});

	client.on('B-user',()=>{
		io.emit('B-user',h.g.users);  //B means Broadcast to all connected users.
	});

	client.on('disconnect',()=>{
		if(h.g.session===undefined){
			console.log('disconnected '+client.id);
			return;
		}
		var i=h.g.session[client.id];
		if(i===undefined){
			console.log('disconnected '+client.id);
			return;
		}
		h.g.lastNum=h.g.lastNum-1;
		h.g.users[i].state="logout";
  		console.log(h.g.users[i].nick + ' is logout');
	});
});






