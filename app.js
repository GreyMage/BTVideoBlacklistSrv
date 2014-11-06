/*
	The basic idea is, the client will come up with a random ID, 
	maybe the current time SHA'd or something. This is the reference
	ID for all their transactions. We track ID, and number of 
	dumps for each ID, along with the dump contents. If someone's
	setup prevents the ID from persisting in localStorage then
	we'll get filled up with single-time dumps from some ID's.
	Those can ignored/removed.
	
	Before any dumps are accepted the client must submit a metrics
	ID. this should be a 36-character alphanumeric lower-case string.
	{
		mid:"0123456789abcdefghijklmnopqrstuvwxyz"
	}		
	
	Dumps should be rate-limited, and should include:
	{
		dump: {
			blacklistVids: [... Array of {videotype,videoid} ...] 
		}
	}
	This allows for future metrics to be collected without breaking
	the model / protocol.
	
	The dumps get saved to disk via NeDB.
			
*/

var io = require('socket.io').listen(8181);
var Datastore = require('nedb'), db = new Datastore({ filename: 'blacklistVids.db', autoload: true });

io.sockets.on('connection', function (socket) {
	socket.on("identify",function(data,fn){
		if(!data.mid){
			fn(false,"Must supply Metrics ID");
			return;
		}
		
		var session_mid = data.mid;
		socket.on("dump",function(data){
			
			// Blacklist Vids
			if(data.blacklistVids){
				var doc = { 
					mid: session_mid,
					blacklistVids: data.blacklistVids,
					time: new Date().getTime()
				};
				db.insert(doc);
			}
			
		});
		fn(true,"Identified.");
	});
	
});