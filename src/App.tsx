import React from "react";
// import logo from "./logo.svg";
// import Scene from "./components/Example";
import WorldTest from "./components/WorldTest";
import NodeGraph from "./components/NodeGraph";
// import NodeGraph from "./components/ChatGPT";
// import "./App.css";
function App() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(width, height);
    return <NodeGraph canvasWidth={width} canvasHeight={height} data={[]} />;
    // return <WorldTest />;
}

export default App;
