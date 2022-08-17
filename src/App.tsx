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
          // Reformat keypoint information as landmarks, for easy drawing.
          const landmarks = detectedObject.keypoints.map(
            (x: { point2d: any }) => x.point2d,
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
      <video className="input_video" />
      <canvas className="output_canvas" width="1920px" height="1200px" />
    </div>
  );
}

export default App;
