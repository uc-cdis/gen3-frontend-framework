import { useUserAuth } from "@gen3/core";
import { LoadingOverlay } from "@mantine/core";

export const User = () => {
  const { data, isFetching } = useUserAuth();
  return (
    <div>
      <h1> User </h1>
      <LoadingOverlay visible={isFetching}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </LoadingOverlay>
    </div>
  );
};
