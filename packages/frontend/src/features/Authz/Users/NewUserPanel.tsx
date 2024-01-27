import { useAuthzContext } from "../Provider";
import { Button, Group, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { EmailInput, IsAdminInput, NameInput, NewUserFormValues, UserId } from "./Inputs";

interface NewUserPanelProps {
  closePanel: () => void;
}

const NewUserPanel = ({ closePanel }: NewUserPanelProps) => {
  const context = useAuthzContext();
  const form = useForm<NewUserFormValues>({
    initialValues: { userId: '', name: '', email: '' },
  });
  return (
    <Stack>
      <UserId form={form} />
      <NameInput form={form} />
      <EmailInput form={form} />
      <IsAdminInput form={form} />
      <Group>
        <Button
          aria-label="create new user"
          onClick={() => {
            context.dispatch({
              type: 'addUser',
              payload: {
                user: {
                  id: form.values.userId,
                  tags: {
                    name: form.values.name,
                    email: form.values.email,
                  },
                },
              },
            });
            closePanel();
          }}
        >
          Create User
        </Button>
        <Button
          aria-label="cancel create user"
          onClick={() => {
            closePanel();
          }}
        >
          Cancel
        </Button>
      </Group>
    </Stack>
  );
};

export default NewUserPanel;
