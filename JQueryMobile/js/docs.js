 var documentsDir;
 
 var fileName;
 var fileContent;
 
 function displayFiles(files) {
	 $("#files").empty();
	 
	 for (var i = 0; i < files.length; i++) {
		 $("#files").append("File Name is " + files[i].name + "<br>");		  
	 }
 }
 
 
 function onsuccess(files) {
	 
	 displayFiles(files);
	 
	 var testFile = documentsDir.createFile(fileName);
	 if (testFile != null) {
		 testFile.openStream(
				 "w",
				 function(fs) {
					 fs.write(fileContent);
					 fs.close();
				 }, function(e) {
					 console.log("Error " + e.message);
				 }, "UTF-8"
		 );
		 displayFiles(files);
	 }
 }

 function onerror(error) {
	 console.log("The error " + error.message + " occurred when listing the files in the selected folder");
 }
 
 
 function loadFiles() {
	 tizen.filesystem.resolve(
		     'documents',
		     function(dir) {
		       documentsDir = dir; 
		       dir.listFiles(displayFiles,onerror);
		     }, function(e) {
		       console.log("Error" + e.message);
		     }, "rw"
		 ); 
 }
 
 function addDoc() {
	 
	 fileName = $("#file-name").val();
	 fileContent = $("#file-content").val();
	 
	 
 }
