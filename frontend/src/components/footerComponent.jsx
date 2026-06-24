import { Trash2 } from "lucide-react";
import React from "react";
import { statState } from "../Context/StatProvider";
const dbObj = [
  {
    path: "/api/user/11",
    status: "HIT-DISK",
    latency: 11,
    age: 2,
  },
  {
    path: "/api/user/11",
    status: "MISS",
    latency: 111,
    age: 23,
  },
  {
    path: "/api/user/12",
    status: "HIT-REDIS",
    latency: 11,
    age: 2,
  },
  {
    path: "/api/user/11",
    status: "MISS",
    latency: 11,
    age: 2,
  },
];
const FooterComponent = () => {
  const {
    recentRequests,
  } = statState();
  return (
    <div className="mt-7.5">
      <div className="bg-[#11151C] p-4 rounded-t-xl border border-gray-700 flex items-center h-14 justify-between">
        <p className="text-white font-medium">Recent requests</p>
        <button className="my-text flex gap-1.5 items-center justify-center p-1.5 px-3 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors">
          <Trash2 className="w-4 h-4 text-red-500" />
          Purge cache
        </button>
      </div>
      <div className="bg-[#11151C] p-3 px-4 border border-t-0 border-gray-700 grid grid-cols-4 w-full items-center">
        <p className="my-text text-left">Path</p>
        <p className="my-text text-left">Status</p>
        <p className="my-text text-left">Latency</p>
        <p className="my-text text-right">Age</p>{" "}
      </div>
      <div className="h-43 overflow-y-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {(recentRequests || []).map((data, index) => {
          const statusStyles = {
            "HIT-DISK": "text-blue-400",
            "HIT-REDIS": "text-green-400",
            MISS: "text-yellow-400",
          };

          console.log(data);
          return (
            <div
              key={index}
              className="bg-[#11151C] p-3 px-4 border border-t-0 border-gray-700 grid grid-cols-4 w-full items-center"
            >
              <p className="my-text text-white text-left">{data.reqPath}</p>
              <p
                className={`my-text ${statusStyles[data.status]} font-bold justify-self-start p-1.5 rounded-lg bg-[#152C2C] text-left`}
              >
                {data.status}
              </p>
              <p className="my-text text-left">{`${data.latency}ms`}</p>
              <p className="my-text text-right">{`${Math.floor(data.age / 1000) // 2
}s ago`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FooterComponent;
