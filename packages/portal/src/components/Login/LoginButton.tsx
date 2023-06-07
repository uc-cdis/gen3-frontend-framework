"use client"
import React from "react";
import { UnstyledButton } from "@mantine/core";
import { useRouter } from "next/router";
import { MdLogin as LoginIcon } from "react-icons/md";
import { GEN3_DOMAIN, useUserAuth } from "@gen3/core";


const LoginButton = () => {
  const router = useRouter();

  const handleSelected = async (isAuthenticated: boolean) => {
    if (!isAuthenticated)
      await router.push(`${GEN3_DOMAIN}/Login`);
    else
      await router.push(`${GEN3_DOMAIN}/user/logout?next=${GEN3_DOMAIN}/`);
  };

  const { isAuthenticated } = useUserAuth();

  return (
    <UnstyledButton className="mx-2 "
      onClick={() => handleSelected(isAuthenticated)}>
      <div className="flex items-center hover:border-b-1 border-white text-primary-contrast font-medium font-heading ">
        {!isAuthenticated ? "Login" : "Logout"}
        <LoginIcon className="pl-1" size={"1.75rem"}/>
      </div>
    </UnstyledButton>
  );
};

export default LoginButton;
