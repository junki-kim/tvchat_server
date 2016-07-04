var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var session = require('express-session');
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.set('view engine', 'pug');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  //cookie: {
  //  maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
  //}
}));

app.get('/', function(req, res){
    if(req.session.user){
      console.log("session name : " + req.session.user.name);
      res.redirect('/chat');
    }
    else
    {
      res.render("index");
    }
});

app.post('/',function(req,res,next){
  console.log("[Log]username : " + req.body.username);

  var user = {
    name : req.body.username
  };  // user name from browser

  req.session.user = user;
  res.redirect('/chat');
});

app.get('/chat', function(req, res){
  if(req.session.user){
      res.render("chat", { username : req.session.user.name});
  }
  else{
    res.redirect('/');
  }
});

app.get('/logout', function(req, res){
  if(req.session.user){
      req.session.destroy();
      res.clearCookie('keyboard cat');
  }
  res.redirect('/');
});

io.on('connection', function(socket){
  socket.broadcast.emit('hi');

  //server 에서 받은 message broadcasting
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log(msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
