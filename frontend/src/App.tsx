import React, { useEffect, useState } from "react";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/HomePage";
import PlaygroundPage from "./pages/PlaygroundPage";
import "./resizeObserverPolyfill"; // Import the polyfill
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRoute from "./components/AuthRoute";
import store, { useAppDispatch } from "./redux/store";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { setLoading, setLogin } from "./redux/auth/authSlice";
import { KJUR } from "jsrsasign";
import { useSelector } from "react-redux";
import LoadingSpinner from "./components/LoadingSpinner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessToast from "./components/SuccessToast";
import ErrorToast from "./components/ErrorToast";
import { Socket } from "socket.io-client";
import { SocketProvider, useSocket } from "./socket/SocketContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute Page={HomePage} />,
  },
  {
    path: "/homePage",
    element: <ProtectedRoute Page={HomePage} />,
  },
  {
    path: "/login",
    element: <AuthRoute Page={LoginPage} />,
  },
  {
    path: "/register",
    element: <AuthRoute Page={RegisterPage} />,
  },
  {
    path: "/playground/:roomId",
    element: <ProtectedRoute Page={PlaygroundPage} />,
  },
]);

function App() {
  const dispatch = useAppDispatch();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.on("connected", () => {
      console.log("Connected to socket");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    return () => {
      socket.off("connected");
      socket.off("disconnect");
    };
  }, [socket]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token && refreshToken) {
        const decodedToken = KJUR.jws.JWS.parse(token).payloadObj as any;
        dispatch(
          setLogin({ userId: decodedToken.userId, token, refreshToken })
        );
      }
      dispatch(setLoading(false));
    };
    init();
  }, [dispatch]);

  const loading = useSelector((state: any) => state.auth.loading);

  return (
    <>
      {loading && <LoadingSpinner />}
      <RouterProvider router={router} />
      <ToastContainer />
      <SuccessToast />
      <ErrorToast />
    </>
  );
}

export default App;
