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
};
// window.onload can work without <body onload="">
window.onload = init;


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

