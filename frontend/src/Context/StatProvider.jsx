import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { healthChk } from "../util/healthCheck.js";
const statContext = createContext();
const StatProvider = ({ children }) => {
  const [hitRate, setHitRate] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [cacheEntries, setCacheEntries] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [hitRateHistory, setHitRateHistory] = useState([]);
  useEffect(() => {
    const healthStatus = async () => {
      try {
        setIsActive(await healthChk());
      } catch (error) {
        setHitRateHistory([]);
        console.error(error);
      }
    };
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/admin/stats",
        );
        console.log(data);
        setHitRate(data.hitRate);
        setTotalRequests(data.totalRequests);
        setCacheEntries(data.cacheEntries);
        setCacheSize(data.cacheSize);
        setRecentRequests(data.recentRequests);
        setHitRateHistory((prev) => {
          if (
            prev.length > 0 &&
            prev[prev.length - 1].hitRate === data.hitRate
          ) {
            return prev;
          }

          return [
            ...prev,
            {
              time: Date.now(),
              hitRate: Number(data.hitRate),
            },
          ];
        });
      } catch (err) {
        console.error(err);
      }
    };
    healthStatus();
    fetchStats();
    const statsInterval = setInterval(fetchStats, 3000);
    const healthInterval = setInterval(healthStatus, 5000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(healthInterval);
    };
  }, []);
  return (
    <>
      <statContext.Provider
        value={{
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
          setIsActive,
          hitRateHistory,
          setHitRateHistory,
        }}
      >
        {children}
      </statContext.Provider>
    </>
  );
};

export const statState = () => {
  return useContext(statContext);
};

export default StatProvider;
