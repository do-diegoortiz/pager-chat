import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import Layout from '../../components/layout'

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
  text?: string;
  url?: string;
  alt?: string | null;
}

interface ITypers {
  [username: string]: boolean;
}

const DEFAULT_MESSAGE: IMessage = {
  type: "text",
  username: "",
  time: new Date(),
  text: "",
};

const ChatRoom: React.FC<Props> = ({ location }) => {
  const [userName, setUserName] = useState<string>("");
  const [message, setMessage] = useState<IMessage>(DEFAULT_MESSAGE);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentTimeout, setCurrentTimeout] = useState<
    ReturnType<typeof setTimeout>
  >();
  const [typing, setTyping] = useState<string>("");

  const BASE_ENDPOINT = "https://pager-hiring.herokuapp.com/?username=";
  const AVATAR_ENDPOINT =
    "https://ui-avatars.com/api/?background=EEE&size=32&name=";
  const GIPHY_ENDPOINT =
    "https://api.giphy.com/v1/gifs/search?api_key=VcLiFEj1SPoqctcTfJiYABIubKxTFLBb&&limit=1&offset=0&rating=g&lang=en&q=";

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
      console.log(userName, " is online");
    });

    let oldMessages: IMessage[] = [];

    socket.on("message", (message: IMessage) => {
      oldMessages.push(message);
      setMessages([...oldMessages]);
    });

    socket.on("is-typing", (typers: ITypers) => {
      const typingPeople = Object.keys(typers).filter((user) => !!typers[user]);

      if (typingPeople.length) {
        const typer =
          typingPeople.length === 1 ? `${typingPeople[0]} is` : "People are";
        setTyping(`${typer} typing...`);
      } else {
        setTyping("");
      }
    });
  }, []);

  const sendMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (message && message.text) {
      if (message.text.trim().slice(0, 4) === "/gif") {
        const searchTerm = message.text.trim().slice(5);
        fetch(GIPHY_ENDPOINT + searchTerm)
          .then((response) => response.json())
          .then(({ data }) => {
            const gifUrl = data[0].images.fixed_height_small.url;

            socket.emit("image-message", { url: gifUrl, alt: searchTerm });
            setMessage(DEFAULT_MESSAGE)
          })
          .catch((error) => console.log(error));
      } else {
        socket.emit("text-message", message.text);
        setMessage(DEFAULT_MESSAGE)
      }
    }
  };

  const updateCurrentMessage = (textMessage: string) => {
    socket.emit("typing", true);

    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    setCurrentTimeout(
      setTimeout(() => {
        socket.emit("typing", false);
      }, 2000)
    );

    setMessage({
      type: "text",
      username: userName,
      time: new Date(),
      text: textMessage,
    });
  };

  return (
    <Layout customStyles={chatBoxStyles}>
        {messages.map((message) => (
          <p key={message.username + message.time}>
            <img src={AVATAR_ENDPOINT + message.username} alt="avatar" />:{" "}
            {message.type === "text" ? (
              message.text
            ) : (
              <img src={message.url} alt={message.alt || "gitImage"} />
            )}
          </p>
        ))}

        <input
          value={message.text}
          onChange={(event) => updateCurrentMessage(event.target.value)}
          onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) =>
            event.key === "Enter" ? sendMessage(event) : null
          }
        />
    </Layout>
  );
};

export default ChatRoom;
