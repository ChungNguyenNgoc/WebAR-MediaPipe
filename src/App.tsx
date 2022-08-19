import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Camera } from "@mediapipe/camera_utils";
import { Objectron } from "@mediapipe/objectron";
import drawingUtils from "@mediapipe/drawing_utils";
import mpObjectron from "@mediapipe/objectron";

function App() {
  useEffect(() => {
    const videoElement = document.getElementsByClassName(
      "input_video",
    )[0] as HTMLVideoElement;
    const canvasElement = document.getElementsByClassName(
      "output_canvas",
    )[0] as HTMLCanvasElement;
    const canvasCtx: CanvasRenderingContext2D | null =
      canvasElement.getContext("2d");

    function onResults(results: {
      image: CanvasImageSource;
      objectDetections: any;
    }) {
      canvasCtx!.save();
      canvasCtx!.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height,
      );
      if (results.objectDetections) {
        for (const detectedObject of results.objectDetections) {
          console.debug("detectedObject: ", detectedObject);
          // Reformat keypoint information as landmarks, for easy drawing.
          const landmarks = detectedObject.keypoints.map(
            (x: { point2d: { x: number; y: number; depth: number } }) =>
              x.point2d,
          );
          // Draw bounding box.
          canvasCtx &&
            drawingUtils.drawConnectors(
              canvasCtx,
              landmarks,
              mpObjectron.BOX_CONNECTIONS,
              { color: "#44f3ff" },
            );
          // Draw centroid.
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[0]], {
              color: "red",
            });
          // const gradient = canvasCtx!.createLinearGradient(100, 100, 300, 300);
          // gradient.addColorStop(0, "red");
          // gradient.addColorStop(0.5, "green");
          // gradient.addColorStop(1, "blue");

          // canvasCtx!.fillStyle = gradient; // fill color
          // canvasCtx!.strokeStyle = gradient; // stroke color
          // canvasCtx!.lineWidth = 20; // stroke width

          // // diagonal rectanges
          // canvasCtx!.fillRect(0, 0, 100, 100);
          // canvasCtx!.fillRect(50, 50, 100, 100);
          // canvasCtx!.fillRect(100, 100, 100, 100);
          // canvasCtx!.fillRect(150, 150, 100, 100);
          // canvasCtx!.fillRect(200, 200, 100, 100);
          // canvasCtx!.fillRect(250, 250, 100, 100);
          // canvasCtx!.fillRect(300, 300, 100, 100);
          // canvasCtx!.fillRect(350, 350, 100, 100);
          // canvasCtx!.fillRect(400, 400, 100, 100);

          // // side rectangles
          // canvasCtx!.strokeRect(300, 100, 100, 100);
          // canvasCtx!.fillRect(100, 300, 100, 100);

          // // right corner rectangles
          // canvasCtx!.fillRect(650, 50, 100, 100);
          // canvasCtx!.strokeRect(650, 350, 100, 100);
        }
      }
      canvasCtx!.restore();
    }

    const objectron = new Objectron({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/objectron/${file}`;
      },
    });
    objectron.setOptions({
      modelName: "Cup",
      maxNumObjects: 2,
    });
    objectron.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await objectron.send({ image: videoElement });
      },
      width: 1920,
      height: 1200,
    });
    camera.start();
  }, []);

  return (
    <div className="container">
      <video className="input_video" style={{ display: "none" }} />
      <canvas className="output_canvas" width="1920px" height="1200px" />
    </div>
  );
}

export default App;
