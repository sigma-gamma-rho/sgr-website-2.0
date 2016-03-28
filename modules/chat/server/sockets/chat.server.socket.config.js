'use strict';

var Chat = require('../models/chat.server.model.js');
// Create the chat configuration
module.exports = function (io, socket) {
  
  // Emit the status event when a new socket client is connected
  io.emit('chatMessage', {
    type: 'status',
    text: 'Is now connected',
    created: Date.now(),
    profileImageURL: socket.request.user.profileImageURL,
    username: socket.request.user.username
  });

  // Send a chat messages to all connected sockets when a message is received
  socket.on('chatMessage', function (message) {
    // Save the incoming message to the MongoLab DB (PJ)
    var newMsg = new Chat(
      {
        name:socket.request.user.username, 
        msg:message.text, 
        img:socket.request.user.profileImageURL
      }
    );
    newMsg.save(function(err){
      if(err) throw err;
    });
    message.type = 'message';
    message.created = Date.now();
    message.profileImageURL = socket.request.user.profileImageURL;
    message.username = socket.request.user.username;

    // Emit the 'chatMessage' event
    io.emit('chatMessage', message);
  });

  var query = Chat.find({});
  query.sort('created').exec(function(err, docs){
    if(err) throw err;
    socket.emit('load:old:messages', docs);
  });

  // Emit the status event when a socket client is disconnected
  socket.on('disconnect', function () {
    io.emit('chatMessage', {
      type: 'status',
      text: 'disconnected',
      created: Date.now(),
      username: socket.request.user.username
    });
  });
};
