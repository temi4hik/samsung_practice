var startTime;
var checkTime;

var imageHtml = "<img alt=\"kitten\" src=\"images/cat.jpg\"><br>";


//Initialize function
var init = function () {
	// TODO:: Do your initialization job
	console.log("init() called");

	
	// add eventListener for tizenhwkey
	document.addEventListener('tizenhwkey', function(e) {
		if(e.keyName == "back") {
			try {
				tizen.application.getCurrentApplication().exit();
			} catch (error) {
				console.error("getCurrentApplication(): " + error.message);
			}
		}
	});
	
	loadCanvas();
	drawChess();
	
};
// window.onload can work without <body onload="">
window.onload = init;


function loadCanvas() {
	var canvas=document.getElementById("draw")
	var ctx=canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.font = "italic 30pt Arial";
    ctx.fillText("Tizen", 20, 50);
    
    ctx.fillStyle = "blue";
    ctx.font = "italic 30pt Arial";
    ctx.fillText("Javascript", 20, 80);
    
    
    ctx.fillStyle = "red";
    ctx.font = "italic 33pt Arial";
    ctx.fillText("Html", 15, 130);
    
    ctx.fillStyle = "blue";
    ctx.font = "italic 30pt Arial";
    ctx.fillText("canvas", 60, 140);
}

function drawChess() {
	var canvas=document.getElementById("chess");
	var ctx=canvas.getContext("2d");
	
	
	var size = 40;
	
	var c = 0;
	
	for (var i = 0; i < 8; ++i) {
		for (var j = 0; j < 8; ++j) {
			var color;
			if (c % 2 == 0) {
				color = "white";
			} else {
				color = "black";
			}
			
			ctx.fillStyle = color;
			ctx.fillRect(j * size, i * size ,size,size);
			
			c += 1;
		}
		c += 1;
	}
}

function changeCss() {
	$('.page2-par').css({'color':'red'});
}

function showImage() {
	
	var image = document.getElementById('kitten');
	
	if (image.innerHTML === "") {
		image.innerHTML = imageHtml;
	} else {
		image.innerHTML = "";
	}
}

function showResolution() {
	var resLabel = document.getElementById('resol');
	
	var h = window.screen.availHeight;
	var w = window.screen.availWidth;
	
	if (resLabel.innerHTML === "") {
		resLabel.innerHTML = "Your resolution is" + h + "x" + w;
	} else {
		resLabel.innerHTML = "";
	}

}

