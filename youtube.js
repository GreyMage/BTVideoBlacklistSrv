// assigning to exports will not modify module, must use module.exports
var Datastore = require('nedb'), db = new Datastore({ filename: 'cache/youtubevideocache.db', autoload: true });
var http = require('http');
//           1 hour in millis * 24 = aday
var maxAge = 3600000          * 24;

module.exports = function() {
  var ns = this;
  ns.getVideo = function(id,callback){

    db.findOne({ id: id }, function (err, doc) {
      if(doc){
        var now = new Date().getTime();
        var age = now - doc.updated;
        if(!isNaN(age) && parseInt(age) < maxAge){
          try{
            var response = JSON.parse(doc.body);
            if(callback)callback(response);
            return;
          } catch(e){}
        }
      }

      // Clean
      db.remove({ id: id }, { multi: true },function(){

        var url = 'http://gdata.youtube.com/feeds/api/videos/'+id+'?v=2&alt=json';
        http.get(url, function(res) {
          var body = '';
          res.on('data', function(chunk) { body += chunk; });
          res.on('end', function() {
            try{
              var response = JSON.parse(body);
              var doc = {id:id,body:body,updated:new Date().getTime()};
              db.insert(doc, function (err, newDoc) {   // Callback is optional
                if(err) console.log(err);
              });
              if(callback)callback(response);
            } catch(e){if(callback)callback();}
          });
        }).on('error', function(e) {
          if(callback)callback();
        });

      })

    });

  }

  return ns;
}
