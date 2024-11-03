import { useState, useEffect } from "react";

const Stopwatch = ({ isRunning }) => {
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (isRunning) {
      console.log("Started");
    } else {
      console.log("Stopped");
      setTime(0);
    }
  }, [isRunning]);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => setTime(time + 1), 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time / 60) % 60);
  const seconds = Math.floor(time % 60);

  return (
    <div className="">
      <p className="">
        {hours}:{minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </p>
    </div>
  );
};

export default Stopwatch;
