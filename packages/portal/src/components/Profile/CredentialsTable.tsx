import { Button, Table } from "@mantine/core";
import {
    useGetCredentialsQuery,
    Gen3FenceCredentials,
    useRemoveCredentialMutation, useCoreSelector, selectCSRFToken
} from "@gen3/core";
import { unixTimeToString } from "@/utils/index";
import { MdDelete as DeleteIcon } from "react-icons/md";

const CredentialsTable = () => {
    const csrfToken = useCoreSelector(selectCSRFToken);
  const { data: credentials } = useGetCredentialsQuery();
    const [removeCredential] =
        useRemoveCredentialMutation();

  const rows = credentials?.map((c: Gen3FenceCredentials) => (
    <tr key={c.jti}>
      <td>{c.jti}</td>
      <td>{unixTimeToString(c.exp)}</td>
      <td>
          <Button leftIcon={<DeleteIcon />} onClick={
                () => removeCredential( {
                    csrfToken: csrfToken,
                    id: c.jti,
                })
          }>
              Delete
          </Button>
      </td>
    </tr>
  ));

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
