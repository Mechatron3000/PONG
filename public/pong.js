var socket;

var textsize;
var radius = 300;

function setup() {
  createCanvas(innerWidth, innerHeight);
	//socket = io.connect('http://78.62.26.153:12345');
	//socket = io.connect('http://localhost:12345');
	socket = io.connect('http://infinipong.cleverapps.io');
	esa = loadImage("assets/esa.png");
	socket.on('frame', drawFrame);
	strokeWeight(5);
  ellipseMode(CENTER);
	angleMode(RADIANS);
  fill(255);
	textsize = height / 32;
	textSize(textsize);
	textAlign(CENTER, CENTER);
}

function drawFrame(frameData) {
	clear();
	background(0);
	rect
	if (frameData.CL.length >= 1) {
		for (i = 0; i < frameData.CL.length; i++) {
			if (frameData.CL[i].status == 'player') {
				noStroke();
				text(frameData.CL[i].score, (width / 2) + (((radius + 16) * cos(frameData.CL[i].angles[5]) * height) / 640), (height / 2) + (((radius + 16) * sin(frameData.CL[i].angles[5]) * height) / 640));
				stroke(255);
				if (frameData.ID == i) {
					stroke(255,0,0);
				}
				for (j = 0; j < 11; j++) {
					line((width / 2) + ((radius * cos(frameData.CL[i].angles[j]) * height) / 640), (height / 2) + ((radius * sin(frameData.CL[i].angles[j]) * height) / 640), (width / 2) + ((radius * cos(frameData.CL[i].angles[j + 1]) * height) / 640), (height / 2) + ((radius * sin(frameData.CL[i].angles[j + 1]) * height) / 640));
				}
			}
			stroke(255);
			rect(10, 10, 50, 50);
			image(esa, (frameData.BL.x * (height / 640)) + ((width - height) / 2) - ((frameData.BL.r * 2 * height) / 1280), ((frameData.BL.y * height) / 640) - (frameData.BL.r * 2 * height) / 1280, (frameData.BL.r * 2 * height) / 640, (frameData.BL.r * 2 * height) / 640);
		}
	}
}

function draw() {
	var data = {
		c: key
	}
	if (keyIsPressed == true) {
		data.c = key;
  }
	else if (mouseIsPressed == true && mouseX > 10 && mouseX < 60 && mouseY > 10 && mouseY < 60) {
		data.c = 'spectator';
	}
	else if (mouseIsPressed == true && mouseX > 10 && mouseX < ((width-height)/2)-10 && mouseY > height/4 && mouseY < 3*height/4) {
		data.c = 'w';
	}
	else if (mouseIsPressed == true && mouseX < width-10 && mouseX > ((width-height)/2)+height+10 && mouseY > height/4 && mouseY < 3*height/4) {
		data.c = 's';
	}
	else {
		data.c = '0';
	}
	socket.emit('key', data);
}