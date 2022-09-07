const express = require('express');
const app = express(); // app instance.
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

io.on('connection', (socket) => {
  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    socket.broadcast.emit('callended');
  });

  socket.on('calluser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('calluser', { signal: signalData, from, name });
  });

  socket.on('answercall', ({ signal, callReceiverName, to }) => {
    io.to(to).emit('callaccepted', { signal, callReceiverName });
  });
});

server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
