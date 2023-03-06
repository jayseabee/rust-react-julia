import React from "react";
import GetCanvas from "./getcanvas";
import WsCanvas from "./wscanvas";

function JuliaCanvas(props) {
  const useSocket = props.api == "websocket";
  return (
    <div className="App-body">
      {useSocket ? <WsCanvas {...props} /> : <GetCanvas {...props} />}
    </div>
  );
}

export default JuliaCanvas;
