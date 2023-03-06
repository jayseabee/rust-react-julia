import "./App.css";
import JuliaCanvas from "./components/juliacanvas";

function App() {
  return (
    <div className="App-body">
      <JuliaCanvas
        api="get" // "websocket" or else runs get
        width={800}
        height={500}
        url="localhost"
        port="8080"
        className="App-canvas"
      ></JuliaCanvas>
    </div>
  );
}

export default App;
