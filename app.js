var express = require('express');
var app = express();
var server = app.listen(8080);
app.use(express.static('public'));
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', newConnection);

function Client(id) {
	this.id = id;
	this.score = 0;
	this.angles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
}
var points = 11;


var Clients = [];
//var cooldown;

var width = 640;
var centerX = width / 2;
var centerY = width / 2;
var radius = 300;
var lastCl = 0;

var ball = {
	r: 0,
	x: 0.5,
	y: 0.5,
}

var lastTouched;
var ballAngle;
var ballSpeed;
var shortAngle;
var shortDist;
var serverTickrate = 1000 / 128;

var angleSpeed = Math.PI / 180;
var setupDone = false;

setInterval(mainLoop, serverTickrate);

function newConnection(socket) {
	var client = new Client(socket.id);
	Clients.push(client);
	
	socket.on('disconnect', removeClient);
	function removeClient(){
		for (i = 0; i < Clients.length; i++) {
			if (Clients[i].id == socket.id) {
				Clients.splice(i, 1);
			}
		}
		recalculate();
	}
	socket.on('key', gotData);
	function gotData(data) {
		var frameData = {
			CL: Clients,
			BL: ball,
			ID: 0
		}
		for (i = 0; i < Clients.length; i++) {
			if (Clients[i].id == socket.id) {
				frameData.ID = i;
				if (data.c == 'w' && (Clients.length == 1 || Clients[i].angles[points - 1] < ((2 * Math.PI * i) / Clients.length) + (Math.PI / Clients.length))) {
					for (j = 0; j < points; j++) {
						Clients[i].angles[j] += angleSpeed;
					}
				}
				if (data.c == 's' && (Clients.length == 1 || Clients[i].angles[0] > ((2 * Math.PI * i) / Clients.length) - (Math.PI / Clients.length))) {
					for (j = 0; j < points; j++) {
						Clients[i].angles[j] -= angleSpeed;
					}
				}
			}
		}
		socket.emit('frame', frameData);
	}
	recalculate();
}

function mainLoop() {
	if (lastCl != Clients.length) {
		console.log(Clients.length);
		lastCl = Clients.length;
	}
	if (setupDone == false) {
		recalculate();
		reset();
		setupDone = true;
	}
  if (Clients.length >= 1) {
    ball.x += Math.cos(ballAngle) * ballSpeed;
    ball.y += Math.sin(ballAngle) * ballSpeed;
		//if (cooldown <= 0) {
			var minDist = ball.r + 1;
			var minAngle = 0;
			for (i = 0; i < Clients.length; i++) {
				for (j = 0; j < points; j++) {
					var x = centerX + (radius * Math.cos(Clients[i].angles[j]));
					var y = centerY + (radius * Math.sin(Clients[i].angles[j]));
					var dist = Math.sqrt(Math.pow(x - ball.x, 2) + Math.pow(y - ball.y, 2));
					if (dist <= minDist) {
						minDist = dist;
						minAngle = Clients[i].angles[j];
						lastTouched = i;
					}
				}
			}
			if (minDist <= ball.r) {
				ballAngle = (2 * minAngle) - ballAngle + Math.PI;
			}
			//cooldown = 0;
		//}
		//cooldown--;
		ballSpeed += 0.001;
		if (ball.x - ball.r > width || ball.y - ball.r > width || ball.x < -ball.r || ball.y < -ball.r) {
			if (lastTouched >= 0 && lastTouched < Clients.length){
				Clients[lastTouched].score++;
			}
			reset();
		}
  }
}

function reset() {
  ballAngle = Math.random() * Math.PI * 2;
  ball.x = (width / 4) + Math.floor(Math.random() * (width / 2));
  ball.y = (width / 4) + Math.floor(Math.random() * (width / 2));
	ballSpeed = 3;
	lastTouched = -1;
	cooldown = 5;
}

function recalculate() {
	ball.r = width / (4 * Clients.length);
	for (i = 0; i < Clients.length; i++) {
		for (j = -((points - 1) / 2); j <= ((points - 1) / 2); j++) {
			Clients[i].angles[j + ((points - 1) / 2)] = ((2 * Math.PI * i) / Clients.length) + ((Math.PI * j) / (Clients.length * 2 * points));
		}
	}
}