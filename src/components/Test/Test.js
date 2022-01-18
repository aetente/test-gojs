import React, { Component } from "react";
import Diagram from "../Diagram/Diagram";
import SelectNodes from "../SelectNodes/SelectNodes";
import "./styles.css";

class Test extends Component {
  render() {
    return (
      <div className="hold-content">
        <div className="content-title" >New Strategy</div>
        <div className="content">
          <SelectNodes />
          <Diagram />
        </div>
      </div>
    );
  }
}

export default Test;
