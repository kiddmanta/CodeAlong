import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface AuthRouteProps {
  Page: React.ComponentType;
}

function AuthRoute({ Page }: AuthRouteProps) {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth.token);
  const loading = useSelector((state: any) => state.auth.loading);


  useEffect(() => {
    if (!loading && token) {
      // console.log("Navigating to home page",token);
      navigate("/homePage");
    }
  }, [token, navigate, loading]);


  return <Page />;
}

export default AuthRoute;
