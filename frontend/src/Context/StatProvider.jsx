import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
const statContext = createContext();
const StatProvider = ({ children }) => {
  const [hitRate, setHitRate] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [cacheEntries, setCacheEntries] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [recentRequests, setRecentRequests] = useState([]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/admin/stats");
        setHitRate(data.hitRate);
        setTotalRequests(data.totalRequests);
        setCacheEntries(data.cacheEntries);
        setCacheSize(data.cacheSize);
        setRecentRequests(data.recentRequests);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    const intervalId = setInterval(fetchStats, 3000);
    return () => clearInterval(intervalId);
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
