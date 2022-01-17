import React, { Component } from "react";
import Test from "../Test/Test";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Redirect,
} from "react-router-dom";

class Navigation extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <Router>
        <Routes>
          <Route exact path="/" element={<Test />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Router>
    );
  }
}

export default Navigation;
