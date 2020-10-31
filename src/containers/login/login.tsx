import React, { useState } from "react";
import { Link } from "react-router-dom";

import styles from './login.module.css'

const Login = () => {
  const [userName, setUserName] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.loginTitle}>Join chat</h1>

        <label className={styles.loginInstruction}>
          Please enter your username
          <input
            className={styles.loginInput}
            placeholder="Type your username here"
            type="text"
            onChange={(event) => setUserName(event.target.value)}
          />
        </label>

        <Link
          className={styles.loginLink}
          onClick={(event) => (!userName ? event.preventDefault() : null)}
          to={`/chat?username=${userName}`}
        >
          <button className={styles.loginBtn} type="submit">Next</button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
