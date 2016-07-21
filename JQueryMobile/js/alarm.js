

function setAlarm() {
	
	var minutes = $("#alarm-period").val();
	
	var alarm = new tizen.AlarmRelative(minutes);
	tizen.alarm.add(alarm, "org.tizen.browser");
	alert("The alarm will trigger at " + alarm.getNextScheduledDate());
	
}