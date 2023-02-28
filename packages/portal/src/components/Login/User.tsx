import { useGetUser } from "@gen3/core";

export const User = () => {
  const { data } = useGetUser();
  return (
    <div>
      <h1> User </h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
