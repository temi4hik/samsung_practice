function getFeed() {
	var FEED_URL = "http://www.3dnews.ru/news/rss/";
	var width = screen.width;
	var i = 0;
	var arr = [];
	
	$.ajax({
		type: "GET",
		url: FEED_URL,
		dataType: "xml",
		
		success: xmlParser
	});
	
	
	function xmlParser(xml){
		$(xml).find("item").each(function(){

			arr[i]= {url_img:$(this).find("enclosure").attr('url'), title:$(this).find("title").text(), description:$(this).find("description").text(),
					link:$(this).find('link').text()};
			setData(arr[i]);
			i++;
		});
		
	}
}


var rssDB 	  = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
IDBTransaction  = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction,
baseName 	  = "sqlDB",
storeName 	  = "filesStore";


function connectDB(f){
	var request = rssDB.open(baseName, 1);
	
	request.onsuccess = function(){
		f(request.result);
	}
	request.onupgradeneeded = function(e){
		var objectStore = e.currentTarget.result.createObjectStore(storeName, { keyPath: "link" });
		connectDB(f);
	}
}

function getData(key, f){
	connectDB(function(db){
		var request = db.transaction([storeName], "readonly").objectStore(storeName).get(key);
		
		request.onsuccess = function(){
			f(request.result ? request.result : -1);
		}
	});
}


function getStorage(f){
	connectDB(function(db){
		var rows = [],
			store = db.transaction([storeName], "readonly").objectStore(storeName);

		if(store.mozGetAll)
			store.mozGetAll().onsuccess = function(e){
				f(e.target.result);
			};
		else
			store.openCursor().onsuccess = function(e) {
				var cursor = e.target.result;
				if(cursor){
					rows.push(cursor.value);
					cursor.continue();
				}
				else {
					f(rows);
				}
			};
	});
}


function setData(obj){
	connectDB(function(db){
		getData(obj['link'], function(res) {
			if (res == -1) {
				var request = db.transaction([storeName], "readwrite").objectStore(storeName).add(obj);
				request.onsuccess = function(){
					return request.result;
				}
			}
		});
		
		
	});
}

function clearStorage(){
	connectDB(function(db){
		var request = db.transaction([storeName], "readwrite").objectStore(storeName).clear();
		request.onerror = logerr;
		request.onsuccess = function(){
			console.log("Clear");
		}
	});
}