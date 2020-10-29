import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

let socket: SocketIOClient.Socket;

interface Location {
  search: string;
}

interface Props {
  location: Location;
}

interface IMessage {
  type: "text" | "image";
  username: string;
  time: Date;
  text: string;
  alt?: string | null;
}

interface ITypers {
  [username: string]: boolean;
}

const DEFAULT_MESSAGE: IMessage = {
  type: "text",
  username: '',
  time: new Date(),
  text: ''
}

const ChatRoom: React.FC<Props> = ({ location }) => {
  const [userName, setUserName] = useState<string>("");
  const [message, setMessage] = useState<IMessage>(DEFAULT_MESSAGE);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentTimeout, setCurrentTimeout] = useState<ReturnType<typeof setTimeout>>();
  const [typing, setTyping] = useState<string>("");

  const BASE_ENDPOINT = "https://pager-hiring.herokuapp.com/?username=";

  useEffect(() => {
    const { username } = queryString.parse(location.search);

    socket = io(BASE_ENDPOINT + username);
    setUserName(username as string);

    return () => {
      setMessages([]);
      socket.disconnect();
    };
  }, [BASE_ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("user-connected", (userName: string) => {
      console.log("El usuario ", userName, " se conectó")
    });

    let oldMessages: IMessage[] = []
      
    socket.on("message", (message: IMessage) => {
      oldMessages.push(message)
      setMessages([...oldMessages]);
    });

    socket.on("is-typing", (typers: ITypers) => {
      const typingPeople = Object.keys(typers).filter(user => !!typers[user])
      
      if (typingPeople.length) {
        const typer = typingPeople.length === 1 ? `${typingPeople[0]} is` : 'People are'
        setTyping(`${typer} typing...`)
      } else {
        setTyping('')
      }
    });
  }, []);

  const sendMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (message) {
      socket.emit("text-message", message.text, () => setMessage(DEFAULT_MESSAGE));
    }
  };

  const updateCurrentMessage = (textMessage: string) => {
    socket.emit("typing", true);
    
    if (currentTimeout) {
      clearTimeout(currentTimeout)
    }

    setCurrentTimeout(setTimeout(() => {
      socket.emit("typing", false);
    }, 2000))

    setMessage({
      type: "text",
      username: userName,
      time: new Date(),
      text: textMessage,
    });
  };

  return (
    <div className="container">
      <h1>Chat</h1>
      <div>
        {messages.map((message) => (
          <p key={message.username + message.time}>{message.username}: {message.text}</p>
        ))}

        <input
          value={message.text}
          onChange={(event) => updateCurrentMessage(event.target.value)}
          onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) =>
            event.key === "Enter" ? sendMessage(event) : null
          }
        />
        <p>{typing}</p>
      </div>
    </div>
  );
};

export default ChatRoom;
