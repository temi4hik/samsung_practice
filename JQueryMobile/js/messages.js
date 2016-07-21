var documentsDir;

function writeMessage() {
	
	var messageFile = null;
	var senderName = $('#sender-name').val();
	var messageText = $('#message-text').val();
	
	tizen.filesystem.resolve(
		     'documents',
		     function(dir) {
		       documentsDir = dir; 
		       dir.listFiles(function(files) {
		    	   
		    	   var fileName = getMsgFileName();
		    	   
		    	   for (var i = 0; i < files.length; ++i) {
		    		   if (files[i].name == fileName) {
		    			   messageFile = files[i];
		    			   break;
		    		   }
		    	   }
		    	   
		    	   if (messageFile == null) {
		    		   messageFile = documentsDir.createFile(fileName);
		    	   }
		    	   
		    	   
		    	   var textToWrite = "time: " + getTime() + "\n" + 
		    	   					 "sender: " + senderName + "\n" + 
		    	   					 "text: " + messageText + "\n";
		    	   
		    	   writeMsgToFile(messageFile, textToWrite);
		       },null);
		     }, function(e) {
		       console.log("Error" + e.message);
		     }, "rw"
		 ); 
}

function getTime() {
	var today = new Date();
	
	var hh = today.getHours()
	var mins = today.getMinutes();
	var secs = today.getSeconds();
	
	
	
	hh = hh >= 10 ? hh : '0' + hh;
	mins = mins >= 10 ? mins : '0' + mins;
	secs = secs >= 10 ? secs : '0' + secs;
	
	
	today = hh + '/' + mins + '/' + secs;
	
	return today;
}

function getMsgFileName() {
	
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth();
	var yyyy = today.getFullYear();
	
	dd = dd >= 10 ? dd : '0' + dd;
	mm = mm >= 10 ? mm : '0' + mm;
	
	return 'mes' + '-' + dd + '-' + mm + '-' + yyyy;
}

function writeMsgToFile(file, text) {
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

//
//function appendMessageToList(file) {
//	file.readAsText(
//	           function(str) {
//	        	   $("#messages-list").append("<li class='message-li' onclick='showMessageContent();'>" + file.name + "</li>")
//	           }, function(e) {
//	             console.log("Error " + e.message);
//	           }, "UTF-8"
//	       );
//}

function showMessageContent() {
	var fileNm = document.getElementById('message0').innerHTML;
	
	
	tizen.filesystem.resolve(
		     'documents',
		     function(dir) {
		       documentsDir = dir;
		       
		       var currF = null;
		       
		       dir.listFiles(function(files) {
		    	   
		    	   for (var i = 0; i < files.length; ++i) {
		    		   if (files[i].name == fileNm) {
		    			   currF = files[i];
		    			   break;
		    		   }
		    	   }
		    	   
		    	   currF.readAsText(
		    			   function(str) {
		    				   alert(str);
		    			   }, null, 'UTF-8'
		    	   );
		    	   
		    	   
		       },null);
		     }, function(e) {
		       console.log("Error" + e.message);
		     }, "rw"
		 ); 
	
	
}

function getMessagesList() {
	var logName = "log.txt";
	
	tizen.filesystem.resolve(
		     'documents',
		     function(dir) {
		       documentsDir = dir; 
		       dir.listFiles(function(files) {
		    	   
		    	   $("#messages-list").empty();
		    	   
		    	   for (var i = 0; i < files.length; ++i) {
		    		   if (files[i].name == logName)
		    			   continue;
		    		   $("#messages-list").append("<li class='message-li'" + "id='message" + i + "'" 
		    				   + "onclick='showMessageContent();'>" 
		    				   + files[i].name + "</li>")
		    	   }
		    	   
		       },null);
		     }, function(e) {
		       console.log("Error" + e.message);
		     }, "rw"
		 ); 
}