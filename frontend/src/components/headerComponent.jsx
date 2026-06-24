import React from 'react'

const HeaderComponent = () => {
  let isRunning = true;
  return (
    <>
      <div className="flex justify-between items-center">
        <div className="font-bold text-white text-2xl">Cache Proxy Dashboard</div>
        <div className="my-text text-lg">{isRunning ? "up 2h 14m" : "offline"}</div>
      </div>
      
    </>
  );
}

export default HeaderComponent
