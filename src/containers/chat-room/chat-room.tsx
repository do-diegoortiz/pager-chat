import React, { useState, useEffect, CSSProperties } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import Layout from '../../components/layout'
import styles from './chat-room.module.css'

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
    "https://ui-avatars.com/api/?background=EEE&size=40&font-size=0.36&name=";
  const GIPHY_ENDPOINT =
    "https://api.giphy.com/v1/gifs/search?api_key=VcLiFEj1SPoqctcTfJiYABIubKxTFLBb&&limit=1&offset=0&rating=g&lang=en&q=";
  const chatBoxStyles: CSSProperties = {
    maxHeight: '70rem',
    padding: '2.4rem 2.4rem 1.2rem'
  }

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
      <section className={styles.messages}>
        {messages.map((message) => (
          <div className={styles.messageContainer} key={message.username + message.time}>
            <img className={styles.userAvatar} src={AVATAR_ENDPOINT + message.username} alt="avatar" />

            <div className={styles.userMessageWrapper}>
              <strong>
                {message.username}
              </strong>

              {message.type === "text" ? (
                message.text
              ) : (
                <img src={message.url} alt={message.alt || "gitImage"} />
              )}
            </div>
          </div>
        ))}

      </section>
      <section className={styles.inputSection}>
        <input
          value={message.text}
          className={styles.inputBox}
          placeholder="Message"
          onChange={(event) => updateCurrentMessage(event.target.value)}
          onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) =>
            event.key === "Enter" ? sendMessage(event) : null
          }
        />
        <span className={styles.inputActionText}>Send</span>
        <p className={styles.typingMessage}>{typing}</p>
      </section>
    </Layout>
  );
};

export default ChatRoom;
