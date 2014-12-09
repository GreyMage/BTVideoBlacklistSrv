var Datastore = require('nedb'), db = new Datastore({ filename: 'blacklistVids.db', autoload: true });
var http = require('http');
var youtube = require('./youtube')();

db.find({}, function (err, docs) {

  var compressed = {};

  for (var i in docs){
    var doc = docs[i];
    var mid = doc.mid;

    if(!compressed[mid]){
      compressed[mid] = doc;
      continue;
    }

    if(compressed[mid].time < doc.time){
      compressed[mid] = doc;
      continue;
    }

  }


  // Find most-hated
  var hated = {};
  for (var i in compressed){
    var doc = compressed[i];
    for( var i in doc.blacklistVids ){
      var entry = JSON.stringify(doc.blacklistVids[i]);
      if(!hated[entry]) hated[entry] = 0;
      hated[entry]++;

    }
    //for(var j in
  }
  //console.log(compressed);
  var hpop = Object.keys(hated).sort(function(a, b){return hated[a] - hated[b];}).map(function(key){return key;}).reverse().slice(0, 20);
  function parseEntry(){
    if(hpop.length == 0) return;
    var entry = JSON.parse(hpop.shift());
    if(entry.videotype == "yt"){

      youtube.getVideo(entry.videoid,function(vid){
        console.log(hated[JSON.stringify(entry)],vid.entry.title["$t"]);
        parseEntry();
      });

    } else {
      console.log(hated[JSON.stringify(entry)],entry);
      parseEntry();
    }
  }
  parseEntry();
  /*
  for(var i in hpop){
  console.log(hpop[i],"Hated:",hated[hpop[i]]);



}*/
//console.log(hpop);
});

//https://gdata.youtube.com/feeds/api/videos/kipf_xFc7Lk?v=2&alt=json
