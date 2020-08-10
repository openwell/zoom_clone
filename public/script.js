const socket = io('/');

const myVideo = document.createElement('video');
const videoGrid = document.getElementById('video-grid');
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030' || 443,
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on('call', function (call) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement('video');
      call.on('stream', function (remoteStream) {
        addVideoStream(video, remoteStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  socket.emit('number_user', ROOM_ID);
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};

window.addEventListener('keydown', (e) => {
  let text = document.getElementById('chat_message');
  if (e.which == 13 && text.value.length !== 0) {
    socket.emit('message', text.value);
    text.value = '';
  }
});
socket.on('create-message', (msg) => {
  const li = document.createElement('li');
  li.append(msg);
  document.getElementById('chats_message_list').appendChild(li);
  const objDiv = document.getElementById('chats_window');
  objDiv.scrollTop = objDiv.scrollHeight;
});
socket.on('number_user', (users) => {
  const num_users = users.length;
  const list = document.getElementsByTagName('video');
  if (num_users == 1) {
    Array.from(list).map((elem) => {
      elem.style.height = '100%';
      elem.style.width = '100%';
    });
  } else if (num_users == 2) {
    Array.from(list).map((elem) => {
      elem.style.height = '300px';
      elem.style.width = '400px';
    });
  } else if (num_users > 2) {
    Array.from(list).map((elem) => {
      elem.style.height = '200px';
      elem.style.width = '300px';
    });
  }
});

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setMuteButton(enabled);
  } else {
    setMuteButton(enabled);
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = (state) => {
  const setMute = document.getElementById('mute_button');
  if (state) {
    setMute.innerHTML = `<i class="fas fa-microphone-slash"></i> <br />
    <small>Unmute</small>`;
  } else {
    setMute.innerHTML = `<i class="fas fa-microphone"></i> <br />
      <small>Mute</small>`;
  }
};

const stopPlayVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setStopPlayVideoButton(enabled);
  } else {
    setStopPlayVideoButton(enabled);
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopPlayVideoButton = (state) => {
  const displayVideo = document.getElementById('video_button');
  if (state) {
    displayVideo.innerHTML = `<i class="fas fa-video-slash"> </i><br />
    <small>Start Video</small>`;
  } else {
    displayVideo.innerHTML = `<i class="fas fa-video"> </i><br />
    <small>Stop Video</small>`;
  }
};

// user name on entering so as to have username
// permission for video connected all the time
// screen sharing
// screen recording
// private message
// video resizing
// showing establishing connection



// document.querySelectorAll('video')[1].currentTime
// since we have like 3 ids and no real way to differentiate when disconnected
// we can listen for disconnect and find non active screens
// else we have to be ale to attach an id to a stream video
// socket id, room_id, peer_id, stream_id
