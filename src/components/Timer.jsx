import React, { useState, useEffect } from "react";

export default function Timer() {
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      <style>
        {`
          .timer-container {
            font-size: 18px;
            white-space: no-wrap;
          }
          
          .timer-value {
            color: #0066FF;
          }
        `}
      </style>
      
      <div className="timer-container">
        Discount reserved for:{" "}
        <span className="timer-value">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
    </>
  );
}
