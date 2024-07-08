import React from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { Playground } from "../../types";
import { capitalize, getTimePassed } from "../../utils/functions";

type FetchedPlayground = Omit<
  Playground,
  "code" | "input" | "participatedUsers"
>;




const JoinedPlaygroundComponent = ({
  playground,
}: {
  playground: FetchedPlayground;
}) => {
  const name = capitalize(playground.name);
  const language = capitalize(playground.language);
  const createdAt = playground.createdAt;

  const timePassed = getTimePassed(createdAt);
  const createdBy = capitalize(playground.createdBy);

  return (
    <div className="card m-5 mx-3 w-72 h-36 flex flex-row justify-between border hover:cursor-pointer border-stone-800 shadow-md shadow-slate-600 transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-br from-zinc-950 to-slate-700">
      <div className="p-2 justify-between flex flex-col">
        <div>
          <p className="text-left text-zinc-300 text-bold text-lg">{name}</p>
          <p className="text-sm pl-1 font-bold text-gray-500">{language}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 flex">
            Owner: <p className="text-bold ml-1">{createdBy}</p>
          </p>
          <p className="text-xs text-gray-500">{timePassed}</p>
        </div>
      </div>
    </div>
  );
};

export default JoinedPlaygroundComponent;
