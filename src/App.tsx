import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import "./App.module.css";
import Login from "./containers/login/login";
import ChatRoom from "./containers/chat-room/chat-room";

const App = () => (
  <Router>
    <Route path="/" exact component={Login} />
    <Route path="/chat" component={ChatRoom} />
  </Router>
);

export default App;
