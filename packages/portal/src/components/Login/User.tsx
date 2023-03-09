import { useUserAuth } from "@gen3/core";

export const User = () => {
  const { data } = useUserAuth();
  return (
    <div>
      <h1> User </h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
