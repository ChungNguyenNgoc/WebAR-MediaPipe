import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.scss";
import { Camera } from "@mediapipe/camera_utils";
import { Objectron } from "@mediapipe/objectron";
import drawingUtils from "@mediapipe/drawing_utils";
import mpObjectron from "@mediapipe/objectron";

function App() {
  const [detection, setDetection] = useState<boolean>(false);

  useEffect(() => {
    let videoElement = document.getElementsByClassName(
      "input_video",
    )[0] as HTMLVideoElement;
    const canvasElement = document.getElementsByClassName(
      "output_canvas",
    )[0] as HTMLCanvasElement;
    const canvasCtx: CanvasRenderingContext2D | null =
      canvasElement.getContext("2d");

    function initVideo(video: HTMLVideoElement, w: number, h: number) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
          video: { width: w, height: h, facingMode: "user" },
        };

        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(function (stream) {
            video.srcObject = stream;
            video.play();
            videoElement = video;
          })
          .catch(function (error) {
            console.debug("Unable to access the camera/webcam.", error);
          });
      } else {
        console.debug("MediaDevices interface not available.");
      }
    }

    // initVideo(videoElement, 1920, 1200);

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
      } else {
        setDetection(false);
      }

      if (results.objectDetections) {
        for (const detectedObject of results.objectDetections) {
          // Reformat keypoint information as landmarks, for easy drawing.
          const landmarks = detectedObject.keypoints.map(
            (x: { point2d: { x: number; y: number; depth: number } }) =>
              x.point2d,
          );

          console.debug("detectedObject: ", detectedObject);
          console.debug("landmarks: ", landmarks);

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
