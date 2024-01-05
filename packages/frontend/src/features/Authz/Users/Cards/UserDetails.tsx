import { Card, Grid, Group,  Stack, Text, Switch } from '@mantine/core';
import { useForm, UseFormReturnType } from '@mantine/form';
import { User } from '../../types';
import { EmailInput, IsAdminInput, NameInput, NewUserFormValues, UserId } from "../Inputs";

interface UserDetailsProps {
  user: User;
}

const UserDetails = ({ user }: UserDetailsProps) => {

  const form = useForm<NewUserFormValues>({
    initialValues: { userId: user.id, name: user.tags?.name ?? '', email: user.tags?.email ?? ''},
  });

  return (
    <Card shadow="sm" padding="md" radius="sm">
      <Stack>
        <UserId form={form} />
        <NameInput form={form} />
        <EmailInput form={form} />
        <IsAdminInput form={form} />
      </Stack>
    </Card>
  );
};

export default UserDetails;
