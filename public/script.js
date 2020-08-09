const socket = io('/');

const myVideo = document.createElement('video');
const videoGrid = document.getElementById('video-grid');
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: 443 || '3030',
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
  console.log(id, 'open');
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  console.log('new user', userId);
};

const addVideoStream = (video, stream) => {
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
    console.log(text.value);
    text.value = '';
  }
});
socket.on('create-message', (msg) => {
  console.log(msg, 'we');
  const li = document.createElement('li');
  li.append(msg);
  document.getElementById('chats_message_list').appendChild(li);
  const objDiv = document.getElementById('chats_window');
  objDiv.scrollTop = objDiv.scrollHeight;
});

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  console.log(myVideoStream);
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
//permission for video connected all the time
// screen sharing
// screen recording
// private message
