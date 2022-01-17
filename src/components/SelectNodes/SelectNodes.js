import React, { Component } from "react";
import "./styles.css";

class SelectNodes extends Component {
  constructor() {
    super();
  }
  render() {
    return (
        <div className="hold-nodes" >
            <div className="list-nodes">
                <div className="list-row">
                    <div className="draggable" draggable="true">Water</div>
                    <div className="draggable" draggable="true">Coffee</div>
                </div>
                <div className="list-row">
                    <div className="draggable" draggable="true">Milk</div>
                    <div className="draggable" draggable="true">Tea</div>
                </div>
            </div>
        </div>
    );
  }
}

export default SelectNodes;
