import React, { useRef, useState, useEffect } from "react";
import putImage from "../utils/putimage";
import rndParams from "../utils/rndParams";

function GetCanvas(props) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [image, setImage] = useState(null);
  const [params, setParams] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const canvasRef = useRef(null);

  // The effects cascade into each other essentially:
  // props/refresh -> params -> data
  // the props take care of the initial render, refresh
  // is used to trigger new renders

  // First we generate some parameters
  useEffect(() => {
    setParams(rndParams());
  }, [props, refresh]);

  // Once we have the parameters it
  // calls the api to get the data
  useEffect(() => {
    const start = Date.now();

    const fetchData = async () => {
      try {
        console.log("Fetch: params: ", params);
        if (params.cx) {
          let url = "http://" + props.url + ":" + props.port + "/julia-image?";
          let url_params = new URLSearchParams({
            width: props.width,
            height: props.height,
            cx: params.cx,
            cy: params.cy,
            iterations: params.iterations,
          });
          const response = await fetch(url + url_params);
          const data = await response.json();
          setIsLoaded(true);
          const end = Date.now();
          data.elapsed_time = end - start;
          setImage(data);
        }

        //await putImage(data);
      } catch (error) {
        console.log("Fetch error.");
        setIsLoaded(true);
        setError(error);
      }
    };

    try {
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, [props, params]);

  // this effect is triggered when the image is loaded
  // and renders the data from api into the canvas
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
      image.elapsed_time +
      "ms.)";
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

export default GetCanvas;
