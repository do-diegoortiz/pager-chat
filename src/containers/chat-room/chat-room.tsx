import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import Layout from "../../components/layout";
import DEFAULT_MESSAGE from "../constants/default-message.const";
import CHAT_BOX_STYLES from "../constants/chat-box-styles.const";
import { ILocation, IMessage, ITypers } from "../interfaces";
import styles from "./chat-room.module.css";

interface Props {
  location: ILocation;
}

let socket: SocketIOClient.Socket;

const ChatRoom: React.FC<Props> = ({ location }) => {
  const [userName, setUserName] = useState<string>("");
  const [message, setMessage] = useState<IMessage>(DEFAULT_MESSAGE);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentTimeout, setCurrentTimeout] = useState<
    ReturnType<typeof setTimeout>
  >();
  const [typing, setTyping] = useState<string>("");

  useEffect(() => {
    const { username } = queryString.parse(location.search);

    socket = io(`${process.env.REACT_APP_BASE_ENDPOINT}${username}`);
    setUserName(username as string);

    return () => {
      setMessages([]);
      socket.disconnect();
    };
  }, [location.search]);

  useEffect(() => {
    socket.on("user-connected", (userName: string) => {
      // No instructions here
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

  const sendMessage = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    event.preventDefault();

    if (!message || !message.text) return;

    const isMessageAGif = message.text.trim().slice(0, 4) === "/gif";

    if (isMessageAGif) {
      const searchTerm = message.text.trim().slice(5);

      fetch(process.env.REACT_APP_GIPHY_ENDPOINT + searchTerm)
        .then((response) => response.json())
        .then(({ data }) => {
          const gifUrl = data[0].images.fixed_height_small.url;

          socket.emit("image-message", { url: gifUrl, alt: searchTerm });
          setMessage(DEFAULT_MESSAGE);
        })
        .catch((error) => console.log(error));
    } else {
      socket.emit("text-message", message.text);
      setMessage(DEFAULT_MESSAGE);
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

  const getFinalMessage = (message: IMessage) => {
    if(message.type === "text") {
      return message.text
    } else {
      return <img src={message.url} alt={message.alt || "gitImage"} />
    }
  }

  return (
    <Layout customStyles={CHAT_BOX_STYLES}>
      <section className={styles.messages}>
        {messages.map((message) => (
          <div
            className={styles.messageContainer}
            key={message.username + message.time}
          >
            <img
              className={styles.userAvatar}
              src={process.env.REACT_APP_AVATAR_ENDPOINT + message.username}
              alt="avatar"
            />

            <div className={styles.userMessageWrapper}>
              <strong>{message.username}</strong>
              {getFinalMessage(message)}
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
