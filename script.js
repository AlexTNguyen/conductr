var videoIDs = [];
var index = 0;
var player = document.getElementById("player");
var playing = false; 
var init = false;
var playlistId;
var videos;

// Controls what happens when the user swipes in a certain direction.
gest.options.subscribeWithCallback(function(gesture) {
    if(gesture) {
    	if(gesture.direction == "Left") previous();
    	else if(gesture.direction == "Right") next();
    	else if(gesture.direction.toLowerCase().includes("up")) play();
    	else if(gesture.direction.toLowerCase().includes("down")) shuffle(); 
    	document.getElementById("direction").innerHTML = "The Conductr just swiped " + gesture.direction +"!";
    }
});

// When the player is ready, load the playlist. 
function onPlayerReady(event) {
	event.target.cuePlaylist({
        listType: 'playlist',
        list: playlistId,
	});
}

function onPlayerStateChange(event) {  
	// When the playlist is loaded
    if (event.data == YT.PlayerState.CUED) {
        videoIDs = event.target.getPlaylist();
        play();
        player.setLoop(true);
		gapi.client.load('youtube', 'v3', function () {
			var requestOptions = {
			    id: videoIDs.toString(),
			    part: 'snippet',
			    maxResults: 50
			};
        	var request = gapi.client.youtube.videos.list(requestOptions);
        	// Setup and add the playlist to the sidebar
        	request.execute(function(response) {
				videos = response.result.items;
				var list = document.getElementById("list");
				for(var i = 0; i < videos.length; i++) {
					var thumbnail = videos[i].snippet.thumbnails.default.url; 
					list.innerHTML += '<div id = "item' + i + '"><a href="#" id = "video' + i + '" onclick="playVideoAt(' + i + ')" class="list-group-item">' + '<img style="float: left; margin-right: 5px;" src="' + thumbnail + '"/>' +  videos[i].snippet.title + '</a></div>';
				}
				document.getElementById("title").innerHTML = videos[player.getPlaylistIndex()].snippet.title;
			});
    	});
	}
	// When a new video plays, display the new title
	if (event.data == YT.PlayerState.PLAYING) {
		document.getElementById("title").innerHTML = videos[player.getPlaylistIndex()].snippet.title;
		$('.active').removeClass('active');
		$('#video' + player.getPlaylistIndex()).toggleClass('active');
		console.log("playing");
    }      
    // When the video ends, play the next one. 
    if(event.data === 0) {            
        next();
    }
}

function playVideoAt(i) {
	player.playVideoAt(i);
	$('.active').removeClass('active');
}

function shuffle() {
	player.setShuffle(true);
  	next();
  	player.setShuffle(false);
  	$('.active').removeClass('active');
}

function previous() {
	player.previousVideo();
	document.getElementById("play").src="img/pause.png";
	$('.active').removeClass('active');
}

function next() {
	player.nextVideo();
	document.getElementById("play").src="img/pause.png";
	$('.active').removeClass('active');
}

function play() {
	if(playing) {
		player.pauseVideo(); 
		playing = false;
		document.getElementById("play").src="img/play.png";
	}
	else {
		player.playVideo();
		playing = true;
		document.getElementById("play").src="img/pause.png";
	}
}

function googleApiClientReady() {
	document.getElementById("submit").addEventListener("click", function(){
		playlistId = document.getElementById("playlist").value;
		gapi.client.setApiKey("AIzaSyADLydlxHYEUP6k67IaLA1m22ZiUIsaxrI");
		var request = gapi.client.request({'path': 'https://www.googleapis.com/youtube/v3/playlists', 'params': {'part': 'snippet', 'id': playlistId}})
			.then(function(response){
				if(response.result.items.length > 0) loadPlaylist();
				else alert("You entered an invalid playlist ID!");
			});
	});
}

function loadPlaylist() {
	document.getElementById("direction").innerHTML = "";
	gapi.client.load('youtube', 'v3', function () {
	    player = new YT.Player('player', {
	          height: '390',
	          width: '640',
	          playerVars: {
	            autoplay: 0,
				controls: 1
				  },
	          events: {
	            'onReady': onPlayerReady,
	            'onStateChange': onPlayerStateChange
	          }
	    });
	    document.getElementById("controls").innerHTML = '<br><img src="img/back.png" onclick="previous()"/> <img src="img/pause.png" id = "play"/> <img src="img/next.png" onclick="next()"/>';
	    $('#play').on('click', function () {
	    	play();
		});
	});
	gest.options.sensitivity(document.getElementById("sensitivity").value);
	document.getElementById("sensitivityLabel").remove();
	document.getElementById("sensitivity").remove();
	document.getElementById("submit").remove();
	document.getElementById("playlist").remove();
	gest.start();
}