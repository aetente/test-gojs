// App.js
import React, { useState, useRef, useCallback, useEffect } from 'react';

import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';

import DiagramPopup from '../DigramPopup/DiagramPopup';

import './styles.css';  // contains .diagram-component CSS

var key = 4;

// ...

function makePort(name, align, spot, output, input) {
  let horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
  const $ = go.GraphObject.make;
  // the port is basically just a small transparent circle
  return $(go.Shape, "Circle",
    {
      desiredSize: new go.Size(7, 7),
      stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
      alignment: align,  // align the port on the main Shape
      alignmentFocus: align,  // just inside the Shape
      portId: name,  // declare this object to be a "port"
      fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
      fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
      cursor: "pointer",  // show a different cursor to indicate potential link point
      fromEndSegmentLength: 30, // make link line turn to connector only from the distance not closer than 30px
      toEndSegmentLength: 30
    });
}

/**
 * Diagram initialization method, which is passed to the ReactDiagram component.
 * This method is responsible for making the diagram and initializing the model and any templates.
 * The model's data should not be set here, as the ReactDiagram component handles that via the other props.
 */
function initDiagram(clickNode) {
  const $ = go.GraphObject.make;
  // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
  const diagram =
    $(go.Diagram,
      {
        // 'animationManager.isInitial': false,
        'undoManager.isEnabled': true,  // must be set to allow for model change listening
        // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
        'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
        // allowMove: false,
        model: $(go.GraphLinksModel,
          {
            linkFromPortIdProperty: "fromPort",  // required information:
            linkToPortIdProperty: "toPort",
            linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
          }),
        layout: $(go.TreeLayout, {
          angle: 270,
          arrangementSpacing: new go.Size(50, 50),
          nodeSpacing: 50,
          setsPortSpot: false,
          setsChildPortSpot: false
          // spacing: new go.Size(30, 30),
          // setsPortSpots: false,
          // columnSpacing: 30,
          // layerSpacing: 30, 
          // sorting: go.TreeLayout.SortingReverse
          // wrappingColumn: 2
        })
        // layout: $(go.LayeredDigraphLayout)
      });

  // define a simple Node template
  diagram.nodeTemplate =
    $(go.Node, go.Panel.Spot,  // the Shape will go around the TextBlock
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      {
        avoidableMargin: new go.Margin(2, 2, 2, 2),
        click: clickNode,
        locationSpot: go.Spot.Center
      },
      $(go.Shape, 'Diamond',
        {
          name: 'SHAPE',
          fill: 'white',
          strokeWidth: 0,
          width: 90,
          height: 90,
          fromLinkable: true, fromLinkableDuplicates: true,
          toLinkable: true, toLinkableDuplicates: true
        },

        // Shape.fill is bound to Node.data.color
        new go.Binding('fill', 'color')),
      $(go.TextBlock,
        {
          margin: 8,
          position: new go.Point(15, 30)
          // editable: true,
        },  // some room around the text
        new go.Binding('text').makeTwoWay()
      ),

      makePort("T", go.Spot.Top, go.Spot.TopSide, true, true),
      makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
      makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
      makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, true)
    );


  // diagram.linkTemplate =
  //   $(go.Link,
  //     {
  //       routing: go.Link.AvoidsNodes,
  //       // curve: go.Link.JumpOver,
  //       corner: 5,
  //       relinkableFrom: true,
  //       relinkableTo: true, 
  //       toShortLength: 4
  //     },
  //     $(go.Shape, // the link's path shape
  //       { strokeWidth: 3, stroke: "#555" }),
  //     $(go.Shape,
  //       { toArrow: "Standard", stroke: null })
  //   );

  diagram.linkTemplate =
    $(go.Link,  // the whole link panel
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        corner: 5, toShortLength: 4,
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: false,
        resegmentable: false,
        selectionAdorned: false
      },
      new go.Binding("points").makeTwoWay(),
      $(go.Shape,  // the highlight shape, normally transparent
        { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
      $(go.Shape,  // the link path shape
        { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
        new go.Binding("stroke", "isSelected", function (sel) { return sel ? "dodgerblue" : "gray"; }).ofObject()),
      $(go.Shape,  // the arrowhead
        { toArrow: "standard", strokeWidth: 0, fill: "gray" }),
      $(go.Panel, "Auto",  // the link label, normally not visible
        { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
        new go.Binding("visible", "visible").makeTwoWay(),
        $(go.Shape, "RoundedRectangle",  // the label shape
          { fill: "#F8F8F8", strokeWidth: 0 }),
        $(go.TextBlock, "Yes",  // the label
          {
            textAlign: "center",
            font: "10pt helvetica, arial, sans-serif",
            stroke: "#333333",
            editable: true
          },
          new go.Binding("text").makeTwoWay())
      )
    );

  diagram.grid =
    $(go.Panel, "Grid",  // or "Grid"
      { gridCellSize: new go.Size(20, 20) },
      $(go.Shape, "LineH", { interval: 1, strokeDashArray: [1, 16] }),
      // $(go.Shape, "LineV", { interval: 1, strokeDashArray: [1, 16] }),
    );

  return diagram;
}

/**
 * This function handles any changes to the GoJS model.
 * It is here that you would make any updates to your React state, which is dicussed below.
 */
function handleModelChange(changes) {
  // alert('GoJS model changed!');
}

function highlight(node, diagramRef) {
  if (!diagramRef.current) return;
  let myDiagram = diagramRef.current.getDiagram();
  let oldskips = myDiagram.skipsUndoManager;
  myDiagram.skipsUndoManager = true;
  myDiagram.startTransaction("highlight");
  if (node !== null) {
    myDiagram.highlight(node);
  } else {
    myDiagram.clearHighlighteds();
  }
  myDiagram.commitTransaction("highlight");
  myDiagram.skipsUndoManager = oldskips;
}

// render function...
export default function Diagram() {

  const [nodes, setNodes] = useState([
    { key: 0, text: 'Alpha', color: 'lightblue' },
    { key: 1, text: 'Beta', color: 'orange' },
    { key: 2, text: 'Gamma', color: 'lightgreen' },
    { key: 3, text: 'Delta', color: 'pink' }
  ]);

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const [popupCoords, setPopupCoords] = useState({ x: 0, y: 0 })

  const [nodeDataToChange, setNodeDataToChange] = useState({})

  const isNewNodeAdded = useHasChanged(nodes)

  const diagramRef = useRef(null);

  const addNode = (newNode) => setNodes(nodes => [...nodes, newNode])

  const changeNode = (newNode) => {
    let indexOfNodeToReplace = nodes.findIndex(node => node.key === newNode.key);
    let copyNodes = [...nodes];
    copyNodes.splice(indexOfNodeToReplace, 1, newNode);
    setNodes(copyNodes);
  }

  const dragStart = useCallback(event => {
    if (event.target.className !== "draggable") return;
    event.dataTransfer.setData("text", event.target.textContent);
    event.dataTransfer.setData("element", event.target);
  }, []);

  const dragEnter = useCallback(event => {
    event.preventDefault();
  }, []);

  const clickNode = (event, obj) => {
    if (!diagramRef.current) return;
    let myDiagram = diagramRef.current.getDiagram();
    if (event === undefined) event = myDiagram.lastInput;
    showPopup(obj)
  }

  // const clickDiagram = (event, obj) => {
  //   setIsPopupVisible(false);
  // }

  const showPopup = (obj) => {
    if (obj !== null) {
      let node = obj.part;
      updateInfoBox(node.location, node.data);
    }
  }

  const updateInfoBox = (coordsVal, data) => {
    setIsPopupVisible(true);
    setPopupCoords(coordsVal);
    setNodeDataToChange(data);
  }

  const dragOver = useCallback(event => {
    if (!diagramRef.current) return;
    let myDiagram = diagramRef.current.getDiagram();
    if (event.target.parentNode === myDiagram.div) {
      let can = event.target;
      let pixelratio = myDiagram.computePixelRatio();



      // if the target is not the canvas, we may have trouble, so just quit:
      if (!(can instanceof HTMLCanvasElement)) return;

      let bbox = can.getBoundingClientRect();
      let bbw = bbox.width;
      if (bbw === 0) bbw = 0.001;
      let bbh = bbox.height;
      if (bbh === 0) bbh = 0.001;
      let mx = event.clientX - bbox.left * ((can.width / pixelratio) / bbw);
      let my = event.clientY - bbox.top * ((can.height / pixelratio) / bbh);
      let point = myDiagram.transformViewToDoc(new go.Point(mx, my));
      let curnode = myDiagram.findPartAt(point, true);
      if (curnode instanceof go.Node) {
        highlight(curnode, diagramRef);
      } else {
        highlight(null, diagramRef);
      }
    }

    if (event.target.className === "dropzone") {
      // Disallow a drop by returning before a call to preventDefault:
      return;
    }
    event.preventDefault();
  }, []);

  const dragDrop = useCallback(event => {
    event.preventDefault();
    if (!diagramRef.current) return;
    let myDiagram = diagramRef.current.getDiagram();

    if (event.target.parentNode === myDiagram.div) {
      let can = event.target;
      let pixelratio = myDiagram.computePixelRatio();

      // if the target is not the canvas, we may have trouble, so just quit:
      if (!(can instanceof HTMLCanvasElement)) return;

      let bbox = can.getBoundingClientRect();
      let bbw = bbox.width;
      if (bbw === 0) bbw = 0.001;
      let bbh = bbox.height;
      if (bbh === 0) bbh = 0.001;
      // TODO recieve information from the element you drag
      // let mx = event.clientX - bbox.left * ((can.width / pixelratio) / bbw) - dragged.offsetX;
      // let my = event.clientY - bbox.top * ((can.height / pixelratio) / bbh) - dragged.offsetY;
      // console.log(dragged.width)
      // console.log(mx)
      let mx = event.clientX - bbox.left * ((can.width / pixelratio) / bbw);
      let my = event.clientY - bbox.top * ((can.height / pixelratio) / bbh);

      let point = myDiagram.transformViewToDoc(new go.Point(mx, my));
      myDiagram.startTransaction('new node');
      let newNode = {
        key,
        location: point,
        text: event.dataTransfer.getData('text'),
        color: "lightyellow"
      };
      // myDiagram.model.addNodeData({
      //   location: point,
      //   text: event.dataTransfer.getData('text'),
      //   color: "lightyellow"
      // });
      //TODO weird animations when using setNodes to add nodes

      addNode(newNode);
      myDiagram.commitTransaction('new node');
      key += 1;
    }

    // If we were using drag data, we could get it here, ie:
    // let data = event.dataTransfer.getData('text');
  }, []);

  useEffect(() => {

    if (diagramRef.current && isNewNodeAdded) {
      setTimeout(() => {
        let myDiagram = diagramRef.current.getDiagram();
        let obj = myDiagram.findNodeForKey(key - 1);
        showPopup(obj);
      }, 500) //TODO try to remove setTimeout
    }


    window.addEventListener("dragstart", dragStart);
    window.addEventListener("dragenter", dragEnter);
    window.addEventListener("dragover", dragOver);
    window.addEventListener("drop", dragDrop);

    return () => {
      window.removeEventListener("dragstart", dragStart);
      window.removeEventListener("dragenter", dragEnter);
      window.removeEventListener("dragover", dragOver);
      window.removeEventListener("drop", dragDrop);
    };
  });

  return (
    <div>
      {isPopupVisible &&
        <DiagramPopup
          popupCoords={popupCoords}
          nodeDataToChange={nodeDataToChange}
          setIsPopupVisible={setIsPopupVisible}
          changeNode={changeNode}
        />}
      <ReactDiagram
        ref={diagramRef}
        initDiagram={() => initDiagram(clickNode)}
        divClassName='diagram-component'
        nodeDataArray={nodes}
        onModelChange={handleModelChange}
      />
    </div>
  );
}

const useHasChanged = (val) => {
  const prevVal = usePrevious(val)
  return prevVal && val && (prevVal.length < val.length)
}

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}