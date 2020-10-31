import React, { useState } from "react";
import { Link } from "react-router-dom";

import './login.css'

const Login = () => {
  const [userName, setUserName] = useState("");

  return (
    <div className="container">
      <div className="login-box">
        <h1 className="login-title">Join chat</h1>

        <label className="login-instruction">
          Please enter your username
          <input
            className="login-input"
            placeholder="Type your username here"
            type="text"
            onChange={(event) => setUserName(event.target.value)}
          />
        </label>

        <Link
          className="login-link"
          onClick={(event) => (!userName ? event.preventDefault() : null)}
          to={`/chat?username=${userName}`}
        >
          <button className="login-btn" type="submit">Next</button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
