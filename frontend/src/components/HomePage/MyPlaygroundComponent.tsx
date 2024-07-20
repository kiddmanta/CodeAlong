import React from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { Playground } from "../../types";
import { capitalize, getTimePassed } from "../../utils/functions";
import { useNavigate } from "react-router-dom";

type FetchedPlayground = Omit<
  Playground,
  "code" | "input" | "participatedUsers"
>;

const DropdownComponent = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent) => void;
}) => {
  return (
    <details className="dropdown dropdown-end" onClick={onClick }>
      <summary className="btn btn-xs bg-transparent border-none m-1">
        <BsThreeDots className="text-white text-lg" />
      </summary>
      <ul className="menu dropdown-content bg-base-100 rounded-lg mr-2 z-[1] w-32 p-2 shadow">
        <li>
          <a>Edit</a>
        </li>
        <li>
          <a>Delete</a>
        </li>
      </ul>
    </details>
  );
};

const MyPlaygroundComponent = ({
  playground,
}: {
  playground: FetchedPlayground;
}) => {
  const name = capitalize(playground.name);
  const language = capitalize(playground.language);
  const createdAt = playground.createdAt;
  const navigate = useNavigate();
  const timePassed = getTimePassed(createdAt);
  const roomId = playground.roomId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation on dropdown click
  };

  return (
    <div
      onClick={() => {
        
        navigate(`/playground/${roomId}`)
      }
    }
      className="card m-5 mx-2 w-72 h-36 flex flex-row justify-between border hover:cursor-pointer border-stone-800 shadow-md shadow-slate-600 transition duration-200 ease-in-out transform hover:scale-105 bg-gradient-to-br from-zinc-950 to-slate-700"
    >
      <div className="p-2 justify-between flex flex-col">
        <div>
          <p className="text-left text-zinc-300 text-bold text-lg">{name}</p>
          <p className="text-sm pl-1 font-bold text-gray-500">{language}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{timePassed}</p>
        </div>
      </div>
      <div className="flex items-start ml-2 p-1">
        <DropdownComponent onClick={handleClick} />
      </div>
    </div>
  );
};

export default MyPlaygroundComponent;
