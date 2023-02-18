import { useUser} from "@gen3/core";


export const User = () => {
  const { data } = useUser("user/user");
  console.log("user", data)
  return (
    <div>
      <h1> User </h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>

  );
}
