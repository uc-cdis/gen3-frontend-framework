import React from "react";
import { useSession } from "../../lib/session/session";
import { useRouter } from "next/router";

interface ProtectedContentProps {
  children: JSX.Element;
}
const ProtectedContent = ({ children }: ProtectedContentProps) => {
  const router = useRouter();
 const  handleOnUnauthenticated = () => {
    router.push("/login");
  }

  const { user, userStatus } = useSession( { required: true , onUnauthenticated: () => handleOnUnauthenticated() } );

  return (
    <div>
      <div>
        {user && userStatus === "authenticated" ? (
          <React.Fragment>
            <p>
              You are signed in as {user.email} and can access this protected
              content.
            </p>
            {children}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <p>
              You are not signed in and cannot access this protected content. Please sign in.
            </p>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default ProtectedContent;
