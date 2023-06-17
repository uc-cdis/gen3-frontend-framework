import { Button, Table } from "@mantine/core";
import {
  useGetCredentialsQuery,
  useRemoveCredentialMutation,
  APIKey,
  useGetCSRFQuery,
} from "@gen3/core";
import { unixTimeToString } from "../../utils/index";
import { MdDelete as DeleteIcon } from "react-icons/md";

const CredentialsTable = () => {
  const { data: csrfToken } = useGetCSRFQuery();
  const { data: credentials } = useGetCredentialsQuery();
  const [removeCredential] = useRemoveCredentialMutation();

  const rows = credentials
    ? credentials.map((c: APIKey) => (
        <tr key={c.jti}>
          <td>{c.jti}</td>
          <td>{unixTimeToString(c.exp)}</td>
          <td>
            <Button
              leftIcon={<DeleteIcon />}
              onClick={() =>
                removeCredential({
                  csrfToken: csrfToken?.csrfToken ?? "",
                  id: c.jti,
                })
              }
            >
              Delete
            </Button>
          </td>
        </tr>
      ))
    : [];

  return (
    <Table striped highlightOnHover withBorder>
      <thead>
        <tr>
          <th>Key</th>
          <th>Expiration</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

export default CredentialsTable;
