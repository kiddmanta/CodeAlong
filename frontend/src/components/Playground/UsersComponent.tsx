import React from "react";
import { GoDotFill } from "react-icons/go";

const UsersComponent = () => {
  // Example users data (replace with actual data fetching logic)
  const activeUsers = ["User 1", "User 2", "User 3", "User 4", "User 5"];
  const inactiveUsers = [
    "User A",
    "User B",
    "User C",
    "User B",
    "User C",
    "User B",
    "User C",
  ];

  return (
    <div className="w-1/6 rounded-r-lg bg-cyan-900 flex flex-col justify-start">
      <div>
        <p className="text-left m-3 text-black text-xl font-bold">
          Users Joined
        </p>
        <div className="h-px bg-black mx-5"></div>
      </div>
      <div className="mt-5">
        <p className="mx-3 my-1 text-black font-semibold">Active Users</p>
        <div className="flex flex-col bg-zinc-800 m-3  overflow-y-auto max-h-40 shadow-md rounded-md">
          {activeUsers.map((user, index) => (
            <div className="flex justify-between items-center pr-2">
              <p key={index} className="mx-3 my-1 font-serif text-gray-300">
                {user}
              </p>
              <GoDotFill className="text-green-500" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="mx-3 my-1 text-black font-semibold">Inactive Users</p>
        <div className="flex flex-col bg-zinc-800 m-3  overflow-y-auto max-h-40 shadow-md rounded-md ">
          {inactiveUsers.map((user, index) => (
            <p key={index} className="mx-3 my-1 font-serif text-gray-300" >
              {user}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersComponent;
