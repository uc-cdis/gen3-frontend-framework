import React, { ReactNode } from "react";
import { useRouter } from "next/router";
import { useSession } from "@/lib/session/session";
import { Center, LoadingOverlay, Paper, Text } from "@mantine/core";

interface ProtectedContentProps {
  children?: ReactNode;
  referer?: string;
}
const ProtectedContent = ({ children, referer }: ProtectedContentProps) => {
  const router = useRouter();
  const onUnauthenticated = () => {
    if (typeof window !== "undefined")
      // route not available on SSR
      router.push({
        pathname: "/Login",
        query: { referer: referer },
      });
  };

  const { status, pending } = useSession(true, onUnauthenticated);

  if (status !== "issued") {
    // not logged in
    if (pending) return <LoadingOverlay visible={pending} />;
    else
      return (
        <React.Fragment>
          <LoadingOverlay visible={pending} />
          <Center>
            <Paper shadow="md" p="md">
              <Text>
                You are not signed in and cannot access this protected content.
                Please login in.
              </Text>
            </Paper>
          </Center>
        </React.Fragment>
      );
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedContent;
