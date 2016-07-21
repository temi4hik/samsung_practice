

function singleVibro() {
	navigator.vibrate(2000);
}

function multiVibro() {
	
	navigator.vibrate([2000, 1000, 500, 1500, 3000]);
}

function stopVibro() {
	
	navigator.vibrate(0);
}


var adapter;

(function(){
	
	try {
		if (tizen.bluetooth === undefined) {
			alert("No bluetooth");
		} else {
			adapter = tizen.bluetooth.getDefaultAdapter();
			//adapter.setChangeListener(UIsliderBT);
			
			
			//window.setInterval(UIsliderBT, 500);
		}
	} catch(ex) {
		alert("Error in bluetooth init");
	}
}());


function BTpowerOn() {
	if (!adapter.powered) {
		adapter.setPowered(true, null, null);
	}
}

function BTpowerOff() {
	
	if (adapter.powered) {
		adapter.setPowered(false, null, null);
	}
}


function UIsliderBT() {
	if (adapter.powered) {
		$("#bluetooth-slider").val("on").slider("refresh");
	} else {
		$("#bluetooth-slider").val("off").slider("refresh");
	}
}

function toggleBluetooth() {
	
	if ($("#bluetooth-slider").val() == "on") {
		BTpowerOn();
	} else {
		BTpowerOff();
	}
}