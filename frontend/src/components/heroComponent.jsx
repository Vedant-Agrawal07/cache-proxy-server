import React, { useState } from "react";
import axios from "axios";
import { statState } from "../Context/StatProvider";

const HeroComponent = () => {
  const {
    hitRate,
    setHitRate,
    totalRequests,
    setTotalRequests,
    cacheEntries,
    setCacheEntries,
    cacheSize,
    setCacheSize,
    recentRequests,
    setRecentRequests,
  } = statState();

  const columnValues = [
    { label: "Hit Rate", value: hitRate },
    { label: "Total Requests", value: totalRequests },
    { label: "Cache Entries", value: cacheEntries },
    { label: "Cache Size", value: cacheSize },
  ];
  // const adminStats = async () => {
  //   const { data } = await axios.get(`/api/admin/stats`);
  //   setHitRate = data.hitRate;
  //   setTotalRequests = data.totalRequests;
  //   setCacheEntries = data.cacheEntries;
  //   setCacheSize = data.cacheSize;
  //   setRecentRequests = data.recentRequests;
  // };

  let isRunning = true;
  return (
    <>
      {!isRunning && (
        <div className="text-red-400 flex items-center justify-center mt-6.5 mb-7.5">
          <p className="inline">Can't reach server proxy is it running ?</p>
        </div>
      )}
      <div className={isRunning && "mt-6.5 mb-7.5"}>
        <div className="grid grid-cols-4 gap-4">
          {columnValues.map((column, index) => (
            <div
              key={index}
              className="bg-[#11151C] p-4 my-text rounded-xl border border-gray-700 pb-6"
            >
              <p>{column.label}</p>
              <p className="font-bold text-white">{column.value}</p>
            </div>
          ))}
        </div>
        <div className="text-white mt-7.5">
          <div className="bg-[#11151C] p-4 rounded-t-xl border border-gray-700 flex items-center h-12">
            <p>Hit rate over time</p>
          </div>
          <div className="bg-[#11151C] p-4 rounded-b-xl border-b border-l  border-r border-gray-700 h-50"></div>
        </div>
      </div>
    </>
  );
};

export default HeroComponent;
