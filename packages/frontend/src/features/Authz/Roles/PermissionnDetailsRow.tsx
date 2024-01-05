import { UseFormReturnType, useForm } from "@mantine/form";
import { TextInput } from "@mantine/core";
import { Permission } from "../types";


export const PermissionId = ({ form }: { form: UseFormReturnType<Permission> }) => {
  return <TextInput {...form.getInputProps("id")}withAsterisk />;
};
export const MethodInput = ({
                            form
                          }: {
  form: UseFormReturnType<Permission>;
}) => {
  return <TextInput {...form.getInputProps("action.method")} />;
};
export const ServiceInput = ({
                             form
                           }: {
  form: UseFormReturnType<Permission>;
}) => {
  return <TextInput {...form.getInputProps("action.service")} />;
};


const PermissionDetailRow = ({ permission }: { permission: Permission }) => {
  const form = useForm<Permission>({
    initialValues: permission,
  });
  return (
    <tr key={permission.id}>
      <td><PermissionId form={form} /></td>
      <td><ServiceInput form={form} /></td>
      <td><MethodInput form={form} /></td>
    </tr>
  );
};

export default PermissionDetailRow;
