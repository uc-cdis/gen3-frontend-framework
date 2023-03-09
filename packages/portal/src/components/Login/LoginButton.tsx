import { Button } from "@mantine/core";
import { useRouter } from "next/router";
import { MdLogin as LoginIcon } from "react-icons/md";
import { useUserAuth, GEN3_DOMAIN } from "@gen3/core";


export const LoginButton = () => {
  const router = useRouter();

  const handleSelected = async (isAuthenticated: boolean) => {
    if (!isAuthenticated)
      await router.push(`${GEN3_DOMAIN}/Login`);
    else
      await router.push(`${GEN3_DOMAIN}/user/logout?next=${GEN3_DOMAIN}/`);
  };

  const { data: userInfo, isAuthenticated } = useUserAuth();
  return (
    <Button onClick={() => handleSelected(isAuthenticated)} variant="filled" rightIcon={isAuthenticated ?? <LoginIcon />}>
      {!isAuthenticated ? "Login" : userInfo?.email}
    </Button>
  );
};
