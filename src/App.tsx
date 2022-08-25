import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";
import { Camera } from "@mediapipe/camera_utils";
import { Objectron } from "@mediapipe/objectron";
import drawingUtils from "@mediapipe/drawing_utils";
import mpObjectron from "@mediapipe/objectron";

function App() {
  const [detection, setDetection] = useState<boolean>(false);

  const handleStart = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    console.debug("touchstart.");
  };

  useEffect(() => {
    let videoElement = document.getElementsByClassName(
      "input_video",
    )[0] as HTMLVideoElement;
    const canvasElement = document.getElementsByClassName(
      "output_canvas",
    )[0] as HTMLCanvasElement;
    const canvasCtx: CanvasRenderingContext2D | null =
      canvasElement.getContext("2d");

    const startup = () => {
      canvasElement.addEventListener("touchstart", handleStart);
    };

    const removeStartup = () => {
      canvasElement.removeEventListener("touchstart", handleStart);
    };

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
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[1]], {
              color: "orange",
            });
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[2]], {
              color: "yellow",
            });
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[3]], {
              color: "green",
            });
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[4]], {
              color: "gray",
            });
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[5]], {
              color: "blue",
            });
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[6]], {
              color: "pink",
            });
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[7]], {
              color: "black",
            });
          canvasCtx &&
            drawingUtils.drawLandmarks(canvasCtx, [landmarks[8]], {
              color: "white",
            });
        }
      }

      if (results.objectDetections) {
        setDetection(true);
        startup();
      } else {
        setDetection(false);
        removeStartup();
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
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
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
      <div className="canvas-container">
        <canvas
          id="canvas"
          className="output_canvas"
          width="1920px"
          height="1200px"
        ></canvas>
        {detection == true ? (
          <h1 className="title">Nguyen Ngoc Bao Chung</h1>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default App;
