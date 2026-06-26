import React, { useState } from "react";
import axios from "axios";
import { statState } from "../Context/StatProvider";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  // type ChartConfig,
} from "@/components/ui/chart";
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
    isActive,
    hitRateHistory,
    setHitRateHistory,
  } = statState();

  const columnValues = [
    { label: "Hit Rate", value: hitRate },
    { label: "Total Requests", value: totalRequests },
    { label: "Cache Entries", value: cacheEntries },
    { label: "Cache Size", value: cacheSize },
  ];

  const chartConfig = {
    hitRate: {
      label: "Hit Rate",
      color: hitRate >= 50 ? "#22c55e" : "#ef4444",
    },
  };
  // const adminStats = async () => {
  //   const { data } = await axios.get(`/api/admin/stats`);
  //   setHitRate = data.hitRate;
  //   setTotalRequests = data.totalRequests;
  //   setCacheEntries = data.cacheEntries;
  //   setCacheSize = data.cacheSize;
  //   setRecentRequests = data.recentRequests;
  // };

  // let isActive = true;
  return (
    <>
      {!isActive && (
        <div className="text-red-400 flex items-center justify-center mt-6.5 mb-7.5">
          <p className="inline">Can't reach server proxy, is it running ?</p>
        </div>
      )}
      <div className={isActive ? "mt-6.5 mb-7.5" : ""}>
        <div className="grid grid-cols-4 gap-4">
          {columnValues.map((column, index) => (
            <div
              key={index}
              className="bg-[#11151C] p-4 my-text rounded-xl border border-gray-700 pb-6"
            >
              <p>{column.label}</p>
              <p className="font-bold text-white text-xl">{column.value}</p>
            </div>
          ))}
        </div>
        <div className="text-white mt-7.5">
          {/* Header */}
          <div className="bg-[#11151C] px-4 h-12 flex items-center rounded-t-xl border border-gray-700">
            <p>Hit rate over time</p>
          </div>

          {/* Chart */}
          <div className="bg-[#11151C] rounded-b-xl border-x border-b border-gray-700 overflow-hidden">
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <AreaChart
                accessibilityLayer
                data={hitRateHistory}
                margin={{
                  top: 8,
                  right: 0,
                  left: 0,
                  bottom: -2,
                }}
              >
                <defs>
                  <linearGradient id="hitRateFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={hitRate >= 50 ? "#22c55e" : "#ef4444"}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor={hitRate >= 50 ? "#22c55e" : "#ef4444"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} horizontal={false} />

                <XAxis hide />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />

                <Area
                  dataKey="hitRate"
                  type="natural"
                  stroke={hitRate >= 50 ? "#22c55e" : "#ef4444"}
                  fill="url(#hitRateFill)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroComponent;
