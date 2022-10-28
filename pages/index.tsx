import io from "socket.io-client";
import { useState, useEffect } from "react";

let socket;

type Message = {
  author: string;
  message: string;
};

type User = {
  name: string;
  id: string;
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [chosenUsername, setChosenUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [users, setUsers] = useState<Array<User>>([]);

  socket = io();

  useEffect(() => {
    socketInitializer();
  }, []);


  const socketInitializer = async () => {
    // We just call it because we don't need anything else out of it
    await fetch("/api/socket");

    socket.on("newIncomingMessage", (msg) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: msg.author, message: msg.message },
      ]);
    });

    socket.on("newUserResponse", (users) => {
      console.log(users, 'user')
      setUsers(users);
    });
    console.log(users,'receives')
  };

  const addUser =async () => {
    setChosenUsername(username);
    localStorage.setItem("userName", username);
    socket.emit("newUser", { name: username, id: socket.id });
    console.log({ name: username, id: socket.id })
  }

  const sendMessage = async () => {
    socket.emit("createdMessage", { author: chosenUsername, message });
    setMessage("");
  };

  const handleKeypress = (e) => {
    //it triggers by pressing the enter key
    if (e.keyCode === 13) {
      if (message) {
        sendMessage();
      }
    }
  };

  return (
    <div>
      <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
        {!chosenUsername ? (
          <>
            <h3 className="font-bold text-xl">
              Your Name
            </h3>
            <input
              type="text"
              placeholder="name..."
              value={username}
              className="border-black border"
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={addUser}
            >
              Start!
            </button>
          </>
        ) : (
          <>
            <p className="font-bold">
              Your username: {username}
            </p>
            <div className="flex bg-gray-100">
              <div className="w-[200px]">
                <span className="font-bold">UserList</span>
                {
                  users.map((item, i) => 
                  <p key={item.id}>{i} - {item.name}</p>
                  )
                }
              </div>
              <div className="flex flex-col justify-end bg-white h-[600px] w-[600px] rounded-md shadow-md ">
                <div className="h-full last:border-b-0 overflow-y-scroll">
                  {messages.map((msg, i) => {
                    return (
                      <div
                        className="w-full py-1 px-2 border-b border-gray-200"
                        key={i}
                      >
                        {msg.author} : {msg.message}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-300 w-full flex rounded-bl-md">
                  <input
                    type="text"
                    placeholder="New message..."
                    value={message}
                    className="outline-none py-2 px-2 rounded-bl-md flex-1"
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleKeypress}
                  />
                  <button
                    className="group-hover:text-white px-3 h-full"
                    onClick={() => {
                      sendMessage();
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}