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
    // console.log(socket.adapter.rooms);
    // console.log(socket.adapter.sids);
    socket.join(roomId);
    // so the thing about it ...if the id is different u will be send to different room
    socket.to(roomId).broadcast.emit('user-connected', userId);
    let room = socket.adapter.rooms[`${roomId}`];
    setTimeout(() => socket.to(roomId).emit('number_user', room), 1000);
    socket.on('message', (message) => {
      io.to(roomId).emit('create-message', message);
    });
    // console.log(socket.id);
  });
  socket.on('number_user', (roomId) => {
    let room = socket.adapter.rooms[`${roomId}`];
    socket.to(roomId).emit('number_user', room);
  });
  socket.on('disconnect', function () {
    // console.log(socket.id);
    // console.log(socket.nsp.adapter.rooms);
    // let num_users = socket.server.eio.clientsCount;
    // socket.to(roomId).emit('number_user', num_users);
    // not perfect how to identify no of ppl in a unique room
  });
});
let port = process.env.PORT || 3030;
server.listen(port, () => {
  console.log('we live @ port', port);
});
