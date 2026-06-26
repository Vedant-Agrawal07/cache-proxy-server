import React, { useEffect, useState } from "react";
import { statState } from "../Context/StatProvider";

const HeaderComponent = () => {
  // let isRunning = true;
  const { isActive } = statState();
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let interval;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [isActive]);
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="font-bold text-white text-2xl">
          Cache Proxy Dashboard
        </div>
        <div className="my-text text-lg">
          {isActive ? formatTime(seconds) : "offline"}
        </div>
      </div>
    </>
  );
};

export default HeaderComponent;
