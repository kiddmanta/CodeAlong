import React, { useEffect, useRef, useState } from "react";
import LanguageSelector from "../components/Playground/LanguageSelector";
import {
  IoMdDownload,
  IoMdInformationCircle,
  IoMdPeople,
  IoMdSettings,
  IoMdSave,
  IoMdCopy,
} from "react-icons/io";
import { VscVersions } from "react-icons/vsc";
import { Socket } from "socket.io-client";
import CodeEditor from "../components/Playground/CodeEditor";
import InformationComponent from "../components/Playground/InformationComponent";
import UsersComponent from "../components/Playground/UsersComponent";
import VersionsComponent from "../components/Playground/VersionsComponent";
import { useParams } from "react-router-dom";
import { useSocket } from "../socket/SocketContext";
import {
  useApproveRequestMutation,
  useRejectRequestMutation,
} from "../redux/api/serverApi";
import useMutationApi from "../hooks/useMutationApi";

const PlaygroundPage = () => {
  const socketRef = useRef<Socket | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [requestQueue, setRequestQueue] = useState<
    { username: string; roomId: string; userId: string }[]
  >([]);
  const [approveRequest, { isLoadingOrFetching: approveLoading }] =
    useMutationApi({
      apiHook: useApproveRequestMutation,
    });
  const [rejectRequest, { isLoadingOrFetching: rejectLoading }] =
    useMutationApi({
      apiHook: useRejectRequestMutation,
    });

  const tabComponents: { [key: string]: JSX.Element } = {
    info: <InformationComponent />,
    users: <UsersComponent />,
    versions: <VersionsComponent />,
    // Add more components as needed
  };

  const handleButtonClick = (tabName: string) => {
    if (selectedTab === tabName) {
      setSelectedTab(""); // Deselect the tab if it's already selected
    } else {
      setSelectedTab(tabName);
    }
  };

  const buttonClasses = (tabName: string) =>
    `mb-4 p-2 rounded transition duration-200 ease-in-out transform ${
      selectedTab === tabName
        ? "bg-cyan-900 text-white scale-105"
        : "bg-zinc-800 text-white hover:bg-cyan-600 hover:scale-105"
    }`;

  const [editorContent, setEditorContent] = useState<String>("");
  const { socket } = useSocket();
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    if (!socket) return;

    console.log("joining room", roomId);
    socket.emit("joinRoom", roomId);
    socket.on("codeChange", (data: string) => {
      setEditorContent(data);
    });
    socket.on("wantsToJoin", ({ username, roomId, userId }) => {
      setRequestQueue((prevQueue) => [
        ...prevQueue,
        { username, roomId, userId },
      ]);
      console.log("wants to join", username, roomId);
    });

    return () => {
      socket.off("codeChange");
    };
  }, [socket, roomId]);

  const handleRequest = (approved: boolean) => {
    const [currentRequest, ...remainingRequests] = requestQueue;
    setRequestQueue(remainingRequests);
    console.log("approving request", currentRequest);


    if (approved) {
      approveRequest({ roomId: currentRequest.roomId, userId: currentRequest.userId });
    } else {
      rejectRequest({ roomId: currentRequest.roomId, userId: currentRequest.userId });
    }
  };

  //connect to socket
  // useEffect(() => {
  //   const init = async () => {

  //     if (!roomId) return; // Ensure roomId is available before connecting

  //     socketRef.current = await initSocket();
  //     console.log("connected to socket", socketRef.current);

  //     socketRef.current.emit("join", roomId);

  //     socketRef.current.on("codeChange", (data) => {
  //       console.log(data); // Handle incoming code changes from other users
  //       setEditorContent(data); // Update editor content based on received data
  //       console.log("code change");
  //     });
  //   };

  //   init();
  //   // socketRef.current = initSocket();

  //   // socket.on("connect_error", (err) => {
  //   //   console.log(err.message);
  //   // });
  //   // socket.on("connect_failed", (err) => {
  //   //   console.log(err.message);
  //   // });

  //   // const handleError = (error: any) => {
  //   //   console.log(error);
  //   //   //add toast error
  //   // }

  //   // socketRef.current.emit("join", roomId);

  //   // socketRef.current.on("codeChange" , (data) => {
  //   //   console.log(data);
  //   // })

  //   // socketRef.current.on('codeChange', (data) => {
  //   //   console.log(data); // Handle incoming code changes from other users
  //   //   setEditorContent(data); // Update editor content based on received data
  //   //   console.log("code change");
  //   // });

  //   console.log("connected to socket", socketRef.current);

  //   return () => {
  //     socketRef.current?.disconnect();
  //   };
  // }, []);

  return (
    <div className="flex min-h-screen">
      {/* Slim Sticky Sidebar */}
      <div className="w-14 bg-zinc-800 text-white flex flex-col items-center py-4 sticky top-0 gap-y-5 shadow-md z-50">
        <button
          className={buttonClasses("info")}
          onClick={() => handleButtonClick("info")}
        >
          <IoMdInformationCircle size={24} />
        </button>
        <button
          className={buttonClasses("users")}
          onClick={() => handleButtonClick("users")}
        >
          <IoMdPeople size={24} />
        </button>
        <button
          className={buttonClasses("versions")}
          onClick={() => handleButtonClick("versions")}
        >
          <VscVersions size={24} />
        </button>
      </div>
      {selectedTab && tabComponents[selectedTab]}

      <div
        className={`flex-1 p-10 flex flex-col ${
          selectedTab ? "w-3/6" : "flex-1"
        }`}
      >
        <div className="flex justify-between">
          <LanguageSelector />
          <div className="flex items-center">
            <button className="btn btn-sm mr-2">
              <IoMdDownload />
            </button>
            <button className="btn btn-sm">Run Code</button>
          </div>
        </div>

        <div className="flex-1 shadow-md rounded-xl overflow-hidden">
          {socketRef && (
            <CodeEditor
              socketRef={socketRef}
              language="javascript"
              roomId={roomId || ""}
            />
          )}
        </div>
      </div>
      <div className="w-2/6 p-10 pl-0 pb-7 flex flex-col">
        <p className="text-left mb-3 mt-3 text-bold tracking-tight">Input : </p>
        <textarea
          className="rounded-xl border h-2/5 shadow-md border-sky-200 mb-4 p-3 resize-none overflow-y-auto bg-zinc-800"
          placeholder="Enter input here..."
        ></textarea>
        <div className="flex justify-between items-center">
          <p className="text-left mb-3 text-bold tracking-tight">Output : </p>
          <button className="btn btn-sm px-7 mb-3">Clear</button>
        </div>

        <textarea
          className="rounded-xl border flex-1 shadow-md border-sky-200 mb-4 p-3 resize-none overflow-y-auto"
          readOnly
        ></textarea>
      </div>
      {requestQueue.length > 0 && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center">
              <h3 className="font-bold text-lg">{requestQueue[0].username}</h3>
              <p className="ml-2"> wants to join the room.</p>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => handleRequest(true)}
              >
                Approve
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleRequest(false)}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaygroundPage;
