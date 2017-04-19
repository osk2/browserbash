const express = require('express');
const app = express();
const pty = require('pty.js');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const basicAuth = require('express-basic-auth');
const config = require('./config.js');
const term = pty.spawn('bash', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 40,
  cwd: process.env.HOME,
  env: process.env
});

app.use(express.static('./'));

app.use(basicAuth({
  users: { config.basicAuthUser: config.basicAuthPwd }
}))

term.on('data', function(data) {
  io.emit('message', data);
});

io.on('connection', function (client) {

  client.on('message', function (data) {
    if (/\t/.test(data)) {
      term.write(data + '\t');
      return;
    }
    if (/sudo |su /.test(data)) {
      io.emit('message', 'No sudo please O_o');
      return;
    }
    if (/^clear$/.test(data)) {
      io.emit('clear');
      term.write('clear\r');
      return;
    }
    if (/^exit|logout|login$/.test(data)) {
      io.emit('message', 'Shut up, you idiot');
      return;
    }
    term.write(data + '\r');
  });

  client.on('typing', function (data) {
    io.emit('typing', data);
  });

  client.on('kill', function () {
    term.kill('SIGINT');
  });

  client.on('chat', function (data) {
    data.id = client.id;
    io.emit('chat', data);
  });
});

server.listen(config.port, function () {
  console.log('App listening on port ' + config.port);
});
