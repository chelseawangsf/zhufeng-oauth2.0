let express = require('express');
let path = require('path');
let uuid = require('uuid');
let bodyParser = require('body-parser');
let app = express();
app.set('views', path.resolve('views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);
app.use(bodyParser.urlencoded({extended:true}));
app.listen(8000);
let USERS = [];
let APPS = [{
  appId: 'zhufengpeixun',//服务器生成的应用ID派发给应用
  secret: '123456',//服务器生成的应用密钥派发给应用
  name: "珠峰培训",
  desc: "中国知名前端培训机构",
  redirect_uri:'http://localhost:3000/callback'
}]
app.get('/reg', function (req, res) {
  res.render('reg');
});
app.post('/reg', function (req, res) {
  let user = req.body;
  user.id = Date.now();
  USERS.push(user);
  res.redirect('/user');
});
app.get('/user', function (req, res) {
  res.render('user');
});
/**
 * get http://localhost:8000/authorize?clientId=zhufengpeixun&redirect_uri=http://localhost:3000/callback
 *
 */
app.get('/authorize', function (req, res) {
  let {clientId} = req.query;
  let appInfo = APPS.find(item => item.appId ==clientId);
  res.render('authorize', {appInfo});
});
//当点击确认授权的时候向此地址提交请求
/**
 * post http://localhost:8000/authorize?clientId=zhufengpeixun&redirect_uri=http://localhost:3000/callback
 * 1. 生成授权码
 * 2. 调用回调的url地址,并把授权码追加上去
 */
let CODES = {}
app.post('/authorize', function (req, res) {
  let body = req.body;
  let apis = body.apis;
  let oldUser = USERS.find(item=>item.username == body.username && item.password == body.password);
  //获取重定向的地址
  let {client_id, redirect_uri} = req.query;
  //生成授权码
  let code = uuid.v4();
  //在服务器端保存此code以及应用的ID 用户ID
  CODES[code] = {
    client_id,
    userId: oldUser.id,
    apis,
    expire: new Date(Date.now() + 10 * 60 * 1000)//过期时间
  }
  //重定向到redirecturi,并传递授权码
  res.redirect(`${redirect_uri}?code=${code}`);
});
let TOKENS = {};
//通过code获取token
app.get('/token', function (req, res) {
  let {code} = req.query;
  let codeInfo = CODES[code];
  let token = uuid.v4();
  //记录此token对应的应用ID和客户ID
  TOKENS[token] = {
    ...codeInfo,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 3)
  }
  res.json({token});
});
//根据token获取用户信息 头像 呢称
app.get('/name', function (req, res) {
  let {token} = req.query;
  let {userId,apis} = TOKENS[token];
  console.log(TOKENS);
  if(apis.indexOf('/name')!=-1){
    let oldUser = USERS.find(item=>item.id == userId);
    res.json({name:oldUser.username});
  }else{
    res.json({data:'用户没有授权'});
  }

});
app.get('/age', function (req, res) {
  let {token} = req.query;
  let {userId,apis} = TOKENS[token];
  if(apis.indexOf('/age')!=-1){
    let oldUser = USERS.find(item=>item.id == userId);
    res.json({age:oldUser.age});
  }else{
    res.json({data:'用户没有授权'});
  }
});