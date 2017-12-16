let express = require('express');
let path = require('path');
let app = express();
app.use(express.static(__dirname));
//http://school.zhufengpeixun.cn
app.get('/login/bind/qq/callback', function (req, res) {
  res.sendFile(path.resolve('./callback.html'));
});
app.listen(80);