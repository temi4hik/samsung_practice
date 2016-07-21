var documentsDir;

function writeLogEnter(type) {
	
	var logFile = null;
	
	tizen.filesystem.resolve(
		     'documents',
		     function(dir) {
		       documentsDir = dir; 
		       dir.listFiles(function(files) {
		    	   
		    	   for (var i = 0; i < files.length; ++i) {
		    		   if (files[i].name == "log.txt") {
		    			   logFile = files[i];
		    			   break;
		    		   }
		    	   }
		    	   
		    	   if (logFile == null) {
		    		   logFile = documentsDir.createFile("log.txt");
		    	   }
		    	   
		    	   var logText = type === 'appenter' ? 'app launched' : 'contacts enter';
		    	   
		    	   
		    	   writeLogToFile(logFile, getNow() + ": " + logText);
		    	   
		       },null);
		     }, function(e) {
		       console.log("Error" + e.message);
		     }, "rw"
		 ); 
}


function getNow() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth();
	var yyyy = today.getFullYear();
	
	
	var hh = today.getHours()
	var mins = today.getMinutes();
	var secs = today.getSeconds();
	
	
	
	dd = dd >= 10 ? dd : '0' + dd;
	mm = mm >= 10 ? mm : '0' + mm;
	
	
	hh = hh >= 10 ? hh : '0' + hh;
	mins = mins >= 10 ? mins : '0' + mins;
	secs = secs >= 10 ? secs : '0' + secs;
	
	
	today = mm + '-' + dd + '-' + yyyy + ' ' + hh + '/' + mins + '/' + secs;
	
	return today;
}

function writeLogToFile(file, text) {
	alert(text);
	file.openStream(
			"a",
			function(fs) {
				fs.write(text + '\n');
				fs.close();
			}, function(e) {
				console.log("Error" + e.message);
			},
			"UTF-8"
		);
}