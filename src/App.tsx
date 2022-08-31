import React, { useEffect, useState } from "react";
import "./App.scss";
import { Camera } from "@mediapipe/camera_utils";
import { Objectron } from "@mediapipe/objectron";
import drawingUtils from "@mediapipe/drawing_utils";
import mpObjectron from "@mediapipe/objectron";

function App() {
  // Call Z(clientX, clientY) the coordinates when the customer touches the screen
  let clientX: number = 0;
  let clientY: number = 0;
  const [detection, setDetection] = useState<boolean>(false);
  const [touchObjectron, setTouchObjectron] = useState<boolean>(false);

  const handleClientTouch = (event: {
    touches: any;
    preventDefault: () => void;
  }) => {
    event.preventDefault();
    // coordinates are normalized to [0.0, 1.0]
    clientX = event.touches[0].clientX / window.screen.width;
    clientY = event.touches[0].clientY / window.screen.height;
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

    const clientTouch = () => {
      canvasElement.addEventListener("touchstart", handleClientTouch);
    };

    const removeClientTouch = () => {
      canvasElement.removeEventListener("touchstart", handleClientTouch);
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
        setDetection(true);
        clientTouch();
        for (const detectedObject of results.objectDetections) {
          // Reformat keypoint information as landmarks, for easy drawing.
          const landmarks = detectedObject.keypoints.map(
            (x: { point2d: { x: number; y: number; depth: number } }) =>
              x.point2d,
          );

          // A landmarks[3]
          // B landmarks[7]
          // C landmarks[6]
          // D landmarks[2]
          // A, B, C, D are the points surrounding the object to form a quadrilateral, respectively
          if (
            clientX != 0 &&
            ((clientX < landmarks[3].x && clientX < landmarks[2].x) ||
              (clientX > landmarks[7].x && clientX > landmarks[6].x)) &&
            ((clientY > landmarks[6].y && clientY > landmarks[2].y) ||
              (clientY < landmarks[3].y && clientY < landmarks[7].y))
          ) {
            setTouchObjectron(false);
          } else if (clientX != 0) {
            setTouchObjectron(true);
          }
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
      } else {
        setDetection(false);
        removeClientTouch();
        setTouchObjectron(false);
        // Set touchObjectron == false when detection == false
        clientX = 0;
        clientY = 0;
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

  console.debug("~touchObjectron: ", touchObjectron);

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
