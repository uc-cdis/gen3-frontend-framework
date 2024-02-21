import { UseFormReturnType } from "@mantine/form";
import { TextInput, Switch } from "@mantine/core";

export interface NewUserFormValues {
  userId: string;
  name: string;
  email: string;
}

export const UserId = ({ form }: { form: UseFormReturnType<NewUserFormValues> }) => {
  return <TextInput {...form.getInputProps("userId")} label="User Id" withAsterisk />;
};
export const NameInput = ({
                            form
                          }: {
  form: UseFormReturnType<NewUserFormValues>;
}) => {
  return <TextInput {...form.getInputProps("name")} label="Full name" />;
};
export const EmailInput = ({
                             form
                           }: {
  form: UseFormReturnType<NewUserFormValues>;
}) => {
  return <TextInput {...form.getInputProps("email")} label="Email" />;
};

export const IsAdminInput = ({
  form
                              }: {
    form: UseFormReturnType<NewUserFormValues>;
  }) => {
        return <Switch labelPosition="left" label="Is Administrator" />;
};
