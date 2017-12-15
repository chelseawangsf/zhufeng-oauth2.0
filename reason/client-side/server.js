let express = require('express');
let path = require('path');
let uuid = require('uuid');
let session = require('express-session');
let request = require('request');
let app = express();
app.set('views', path.resolve('views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);
app.use(session({
  resave: true,
  secret: 'zfpx',
  saveUninitialized:true
}));
app.listen(3000);
let appInfo = {
  appId: 'zhufengpeixun',//服务器生成的应用ID派发给应用
  secret: '123456',//服务器生成的应用密钥派发给应用
  name: "珠峰培训",
  desc: "中国知名前端培训机构",
  redirect_uri: 'http://localhost:3000/callback'
}
app.get('/login',function(req,res){
  res.render('login',{url:`http://localhost:8000/authorize?clientId=${appInfo.appId}&redirect_uri=${appInfo.redirect_uri}`});
});
/**
 * 应用的回调地址
 * 如果QQ服务器认证通过后会回调我这个地址,并且把授权码传过来
 * http://localhost:3000/callback?code=abc
 */
app.get('/callback', async function (req, res) {
  //客户端回调接口获取服务器办法的code
  let {code} = req.query;
  let {token} = await fetch(`http://localhost:8000/token?code=${code}`);
  req.session.token = token;
  console.log(req.session);
  res.json({code: 0});
});

app.get('/name', async function (req, res) {
  let {token}  = req.session;
  console.log(`http://localhost:8000/name?token=${token}`);
  let result = await fetch(`http://localhost:8000/name?token=${token}`);
  res.json(result);
});

app.get('/age', async function (req, res) {
  let {token}  = req.session;
  let result = await fetch(`http://localhost:8000/age?token=${token}`);
  res.json(result);
});

async function fetch(url) {
  return new Promise(function (resolve, reject) {
    request(url, 'utf8', function (err, response, body) {
      resolve(JSON.parse(body));
    });
  });
}
