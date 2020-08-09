const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuid } = require('uuid');
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.set('view engine', 'ejs');
app.use('/peerjs', peerServer);
app.use(express.static('public'));
app.get('/', (req, res) => {
  //   res.render('rooms');
  // res.status(200).send('Hello world')
  res.redirect(`/${uuid()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    // so the thing about it ...if the id is different u will be send to different room
    socket.to(roomId).broadcast.emit('user-connected', userId);
    console.log('joined room');
    socket.on('message', (message) => {
      io.to(roomId).emit('create-message', message);
    });
  });
});

server.listen(3030, () => {
  console.log('we live @ port 3030');
});
