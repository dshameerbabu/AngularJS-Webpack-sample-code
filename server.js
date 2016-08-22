var express = require('express'),
    app = express();

//app.use(express.static(__dirname + '/' + 'buildRelease'));
//app.listen(3001);
//console.log('server is running on 3001');
app.use(express.static(__dirname ));
app.listen(3001);
console.log('server is running on 3001');