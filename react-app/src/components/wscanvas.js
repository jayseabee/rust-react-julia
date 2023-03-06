import React, { useState, useEffect, useRef } from "react";
import putImage from "../utils/putimage";
import rndParams from "../utils/rndParams";

function WsCanvas(props) {
  const [socket, setSocket] = useState(null);
  const [socketOpen, setSocketOpen] = useState(false);
  const [params, setParams] = useState([]);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const canvasRef = useRef(null);

  // Here is how various props and state chain through to the render:
  // props -> socket -> socket.open -> params -> sendParams -> socket.onmessage -> putImage
  // refresh                          -> params ^

  useEffect(() => {
    function createSocket() {
      let socket_url = "ws://" + props.url + ":" + props.port + "/ws";
      let lsocket = new WebSocket(socket_url);
      lsocket.binaryType = "arraybuffer";

      lsocket.onopen = () => {
        setSocketOpen(true);
        setParams(rndParams());
      };

      lsocket.onclose = () => {
        console.log("socket closed.");
        if (!socketOpen) {
          setError({ message: "No server found ..." });
        }
        setSocketOpen(false);
      };

      lsocket.onmessage = (ev) => {
        if (ev.data instanceof ArrayBuffer) {
          setIsLoaded(true);
          const e = Date.now();
          setEndTime(e);

          setImage({
            status: "healthy",
            data: new Uint8Array(ev.data),
          });
        } else {
          setError({ message: "invalid data" });
          console.log(ev.data);
        }
      };

      setSocket(lsocket);
    }

    createSocket();
    // eslint-disable-next-line
  }, [props]);

  // Re-generate when refresh button is pressd
  useEffect(() => {
    setParams(rndParams());
  }, [refresh]);

  useEffect(() => {
    function sendParams() {
      if (socket && params) {
        if (socket.readyState === 1) {
          let msg = {
            width: props.width,
            height: props.height,
            cx: params.cx,
            cy: params.cy,
          };
          socket.send(JSON.stringify(msg));
          const s = Date.now();
          setStartTime(s);
        } else {
          console.log(
            "sendParams: socket not ready: state: ",
            socket.readyState
          );
        }
      }
    }

    sendParams();
    // eslint-disable-next-line
  }, [params]);

  useEffect(() => {
    try {
      putImage(canvasRef, image);
    } catch (error) {
      console.log(error);
    }
  }, [image]);

  function refreshPage() {
    // we force the component to re-render by
    // changing the state which triggers the
    // fetchData effect, which updates the items data
    // and that then triggers the putImage effect
    setIsLoaded(false);
    //setCount(count + 1);
    setRefresh(!refresh);
  }

  let status = "";
  if (error) {
    status = "Error: " + error.message;
  } else if (!isLoaded) {
    status = "Loading ...";
  } else {
    status =
      "cx = " +
      params.cx.toFixed(4) +
      ", cy = " +
      params.cy.toFixed(4) +
      " (" +
      (endTime - startTime) +
      "ms)";
  }

  return (
    <div className="App-body">
      {status}
      <canvas ref={canvasRef} {...props} />
      <button type="button" onClick={refreshPage}>
        Refresh
      </button>
    </div>
  );
}

export default WsCanvas;
