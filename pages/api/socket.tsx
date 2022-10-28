import { Server } from "socket.io";
export default function SocketHandler(req, res) {
  // It means that socket server was already initialised
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  let users = []

  io.on('connection', (socket) => {
    socket.on("createdMessage", data => {
      io.emit("newIncomingMessage", data)
    })

    socket.on("typing", data => (
      socket.broadcast.emit("typingResponse", data)
    ))

    socket.on("newUser", data => {
      users.push(data)
      io.emit("newUserResponse", users)
    })
 
    socket.on('disconnect', () => {
      users = users.filter(user => user.id !== socket.id)
      io.emit("newUserResponse", users)
      socket.disconnect()
    });
  });


  console.log("Setting up socket");
  res.end();
}