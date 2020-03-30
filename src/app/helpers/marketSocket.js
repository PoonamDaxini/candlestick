//just to test
const io = require('socket.io-client');

const socketEndpoint = "wss://stream.coindcx.com";

const socket = io(socketEndpoint, {
  transports: ['websocket']
});


//Join Channel
socket.emit('join', {
  'channelName': "B-ZRX_BTC",
});

//Listen update on channelName
socket.on("new-trade", (response) => {
  console.log(response.data);
});

// // leave a channel
// socket.emit('leave', {
//   'channelName': channelName
// });