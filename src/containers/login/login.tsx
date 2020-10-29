import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [userName, setUserName] = useState("");

  return (
    <div>
      <h1>Login</h1>
      <input
        placeholder="SuperUserName"
        type="text"
        onChange={(event) => setUserName(event.target.value)}
      />

      <Link
        onClick={(event) => (!userName ? event.preventDefault() : null)}
        to={`/chat?username=${userName}`}
      >
        <button type="submit">Next</button>
      </Link>
    </div>
  );
};

export default Login;
