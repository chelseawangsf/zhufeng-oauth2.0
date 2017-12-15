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
  appId: 'appId',//服务器生成的应用ID派发给应用
  secret: '123456',//服务器生成的应用密钥派发给应用
  name: "珠峰大前端网校",
  desc: "中国知名前端培训机构",
  redirect_uri: 'http://localhost:3000/callback',
  scope:'get_user_info,list_album,upload_pic,do_like'
}
app.get('/login',function(req,res){
  res.render('login',{url:`https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${appInfo.appId}&redirect_uri=${appInfo.redirect_uri}&scope=${appInfo.scope}`});
});
/**
 * 应用的回调地址
 * 如果QQ服务器认证通过后会回调我这个地址,并且把授权码传过来
 * http://localhost:3000/callback?code=abc
 */
app.get('/callback', async function (req, res) {
  //客户端回调接口获取服务器办法的code
  let {code} = req.query;
  let {access_token} = await fetch(`https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${appInfo.appId}&client_secret=${appInfo.secret}&code=${code}&state=state&redirect_uri=${appInfo.redirect_uri}`);
  req.session.access_token = access_token;
  let {openid} = await fetch(`https://graph.qq.com/oauth2.0/me?access_token=${access_token}`);
  req.session.openid = openid;
  res.json({access_token,openid});
});

app.get('/get_user_info', async function (req, res) {
  let {access_token,openid}  = req.session;
  let result = await fetch(`https://graph.qq.com/user/get_user_info?access_token=${access_token}&oauth_consumer_key=${appInfo.appId}&openid=${openid}`);
  res.json(result);
});


async function fetch(url) {
  return new Promise(function (resolve, reject) {
    request(url, 'utf8', function (err, response, body) {
      resolve(JSON.parse(body));
    });
  });
}
