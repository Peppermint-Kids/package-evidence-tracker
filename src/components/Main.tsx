import React from "react";
import Webcam from "react-webcam";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/SettingsProvider";
import { useToast } from "./ui/use-toast";
import Stopwatch from "./StopWatch";

Date.prototype.yyyymmdd = function () {
  const mm = this.getMonth() + 1; // getMonth() is zero-based
  const dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

const Main: React.FC = () => {
  const barcodeRef = React.useRef<HTMLInputElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = React.useState<[number, number]>([
    64, 48,
  ]);

  const { settings } = useSettings();
  const { toast } = useToast();

  const webcamRef = React.useRef<Webcam>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder>(null);
  const [capturing, setCapturing] = React.useState(false);

  const handleDataAvailable = ({ data }) => {
    let recordedChunks: BlobPart[] = [];
    if (data.size > 0) {
      recordedChunks = [].concat(data);
    }

    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = `${new Date().yyyymmdd()}-${barcodeRef.current?.value}.webm`;
      a.click();
      window.URL.revokeObjectURL(url);
      barcodeRef.current.value = "";
    }
  };

  const handleStartCaptureClick = () => {
    setCapturing(true);
    const canvasStream = canvasRef.current.captureStream();
    mediaRecorderRef.current = new MediaRecorder(canvasStream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  };

  const handleStopCaptureClick = () => {
    mediaRecorderRef.current?.stop();
    setCapturing(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const draw = (ctx, frameCount, canvas) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(webcamRef.current.video, 0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    ctx.fillStyle = "yellow";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const now = new Date();
    const timestamp = now.toLocaleString();
    ctx.fillText(timestamp, 4, 4);
  };

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: settings.deviceId },
      })
      .then((display) => {
        const a = display.getVideoTracks()[0].getSettings();
        setCanvasSize((prevVal) =>
          a?.width &&
          a?.height &&
          (prevVal[0] !== a.width || prevVal[1] !== a.height)
            ? [a.width, a.height]
            : prevVal
        );
      });
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frameCount = 0;
    let animationFrameId: number;
    //Our draw came here
    const render = () => {
      frameCount++;
      draw(context, frameCount, canvas);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return (
    <div>
      <div className="flex w-full items-center gap-1.5">
        <div>
          <Label htmlFor="awb">Tracking Number</Label>
          <Input
            ref={barcodeRef}
            type="text"
            id="barcode"
            onKeyDown={(e) => {
              if (e.key === "Enter") barcodeRef.current?.blur();
            }}
            tabIndex={1}
            onBlur={(e) => {
              if (e.target.value === "") {
                toast({
                  variant: "destructive",
                  title: "Error!",
                  description: "Enter AWB number",
                });
              } else {
                if (capturing) {
                  handleStopCaptureClick();
                } else {
                  handleStartCaptureClick();
                  barcodeRef.current.value = "";
                }
                barcodeRef.current?.focus();
              }
            }}
          />
          <div />
        </div>
      </div>
      <div
        className="mt-8 flex gap-2"
        tabIndex={2}
        onFocus={(e) => e.target.blur()}
      >
        {capturing ? (
          <div className="flex gap-2 items-center">
            <svg
              height="10"
              width="10"
              xmlns="http://www.w3.org/2000/svg"
              className="svg-shadow"
            >
              <circle r="5" cx="5" cy="5" fill="tomato" />
            </svg>
            Recording..
          </div>
        ) : (
          "Recording stopped"
        )}
        <Stopwatch isRunning={capturing} />
      </div>
      <div>
        <Webcam
          width={"0%"}
          ref={webcamRef}
          audio={false}
          videoConstraints={{
            deviceId: settings.deviceId,
            facingMode: "user",
          }}
        />
        <canvas
          width={`${canvasSize[0]}px`}
          height={`${canvasSize[1]}px`}
          style={{
            width: "1200px",
            height: "900px",
            objectFit: "contain",
            objectPosition: "0 0",
          }}
          ref={canvasRef}
        />
      </div>
    </div>
  );
};

export default Main;
