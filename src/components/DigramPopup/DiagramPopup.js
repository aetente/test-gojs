import React, { useState, useRef, useCallback, useEffect } from 'react';
import "./styles.css";

 //TODO find the better way to find offsets
const diagramOffsetX = 700;
const diagramOffsetY = 180;

export default function DiagramPopup(props) {
    const inputRef = useRef(null)
    return (
        <div
            className="hold-popup"
            style={{
                left: props.popupCoords.x + diagramOffsetX || 0,
                top: props.popupCoords.y + diagramOffsetY || 0
            }}
        >
            <div>
                <input
                    key={`node-change-${props.nodeDataToChange.key}`}
                    ref={inputRef}
                    className="nodrag"
                    type="text"
                    defaultValue={props.nodeDataToChange.text}
                />
                <button
                    onClick={() => {
                        let newNode = {...props.nodeDataToChange, text: inputRef.current.value};
                        props.changeNode(newNode);
                        props.setIsPopupVisible(false);
                    }}
                >enter</button>
            </div>
        </div>
    )
}