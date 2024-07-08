import React from "react";

const InformationComponent = () => {
  return (
    <div className="w-1/6 rounded-r-lg bg-cyan-900 flex flex-col justify-between">
      <div>
        <p className="text-left m-3 text-black text-xl text-bold">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae,
          aut.
        </p>
        <div className="h-px bg-black mx-5"></div>
      </div>

      <div className="flex flex-col">
        <button className="btn-md btn m-3">Copy Room Id</button>
        <button className="btn-md btn m-3 mt-0">Save Playground</button>
      </div>
    </div>
  );
};

export default InformationComponent;
