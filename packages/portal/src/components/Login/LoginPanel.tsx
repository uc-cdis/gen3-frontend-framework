import React from "react";
import { useRouter } from "next/router";
import { showNotification } from "@mantine/notifications";
import TexturedSidePanel from "@/components/Layout/TexturedSidePanel";
import LoginProvidersPanel from "@/components/Login/LoginProvidersPanel";
import TextContent, {
  TextContentProps,
} from "@/components/Content/TextContent";

export interface LoginPanelProps {
  readonly sideTexture?: string;
  topContent?: ReadonlyArray<TextContentProps>;
  bottomContent?: ReadonlyArray<TextContentProps>;
}
const LoginPanel = ({
  sideTexture,
  topContent,
  bottomContent,
}: LoginPanelProps) => {
  const router = useRouter();
  const {
    query: { redirect },
  } = router;

  const handleLoginSelected = async (url: string, redirect?: string) => {
    router
      .push(
        url +
          (redirect ? `?redirect=${redirect}` : "?redirect=https://localhost/"),
      )
      .catch((e) => {
        showNotification({
          title: "Login Error",
          message: `error logging in ${e.message}`,
        });
      });
  };

  return (
    <div className="flex flex-row justify-between">
      <TexturedSidePanel />
      <div className="mt-24 justify-center sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-xl mx-180">
        {topContent?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}

        <LoginProvidersPanel
          handleLoginSelected={handleLoginSelected}
          redirectURL={redirect as string | undefined}
        />

        {bottomContent?.map((content, index) => (
          <TextContent {...content} key={index} />
        ))}
      </div>
      <TexturedSidePanel />
    </div>
  );
};


export default LoginPanel;
