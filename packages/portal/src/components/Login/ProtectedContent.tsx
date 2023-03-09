import React from "react";
import { useUserAuth } from "@gen3/core";
import { getCookie } from 'cookies-next';

export const getSessionStatus = () => {


  const accessToken = getCookie("csrftoken");
  const access_token = getCookie("access_token");
  console.log("csrftoken", accessToken);
  console.log("access_token", access_token);
};


const ProtectedContent = () => {
  const { data: user, isAuthenticated } = useUserAuth();

  getSessionStatus();

  return (
    <div>
      <div>
        {user && isAuthenticated ? (
          <React.Fragment>
            <p>
              You are signed in as {user.email} and can access this protected
              content.
            </p>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p>
              You are not signed in and cannot access this protected content.
            </p>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default ProtectedContent;
