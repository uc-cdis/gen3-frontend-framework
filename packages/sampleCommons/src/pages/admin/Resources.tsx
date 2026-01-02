import React, { useMemo, useState } from 'react';

import { convertPathsToTree } from '@gen3/frontend/utils/convertResourcePathsToTree';
import NavPageLayout from '@gen3/frontend/features/Navigation/NavPageLayout';
import { getNavPageLayoutPropsFromConfig } from '@gen3/frontend/lib/common/staticProps';
import { NavPageLayoutProps } from '@gen3/frontend/features/Navigation/types';
import {
  useCreateAuthzResourceMutation,
  useGetAuthzResourcesQuery,
} from '@gen3/core';
import { GetServerSideProps } from 'next';
import {
  Button,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
  Tree,
} from '@mantine/core';
import { FaChevronDown as ChevronDown } from 'react-icons/fa';

const AuthzResourceManagement = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps) => {
  const [resourcePath, setResourcePath] = useState<string>('');
  const [newResourcePath, setNewResourcePath] = useState<string>('');
  const [resourceName, setResourceName] = useState<string>('');
  const [resourceDescription, setResourceDescription] = useState<string>('');
  const {
    data: resources,
    error,
    isError,
    isFetching,
  } = useGetAuthzResourcesQuery();

  const [
    addResource,
    { isLoading: isCreateResourceLoading, isError: isCreateResourceError },
  ] = useCreateAuthzResourceMutation();

  const handleAddResource = () => {
    addResource({
      resourcePath: resourcePath,
      data: {
        path: newResourcePath,
        name: resourceName,
        description: resourceDescription,
      },
    });
  };

  const resourceData = useMemo(() => {
    if (resources?.resources && resources.resources.length > 0 && !isError) {
      return convertPathsToTree(resources?.resources);
    }
    return [];
  }, [isError, resources?.resources]);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Resource Management Page',
        content: 'Forms Data',
        key: 'gen3-resource-management-page',
      }}
    >
      <Stack>
        <Stack className="p-4">
          <Text>Resources</Text>
          <div className="p-4 border-1 border-base-darker">
            <LoadingOverlay visible={isFetching} />
            <Tree
              data={resourceData}
              renderNode={({ node, expanded, hasChildren, elementProps }) => (
                <Group gap={5} {...elementProps}>
                  {hasChildren && (
                    <ChevronDown
                      size={18}
                      style={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  )}
                  <span>{node.label}</span>
                </Group>
              )}
            />
          </div>
        </Stack>
        <Stack className="p-4">
          <Text>Add Resources</Text>
          <Stack>
            <TextInput
              placeholder="Resource Path"
              value={resourcePath}
              onChange={(e) => setResourcePath(e.target.value)}
            />
            <TextInput
              placeholder="New Resource Path"
              value={newResourcePath}
              onChange={(e) => setNewResourcePath(e.target.value)}
            />
            <TextInput
              placeholder="Resource Name"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
            />
            <TextInput
              placeholder="Resource Desc"
              value={resourceDescription}
              onChange={(e) => setResourceDescription(e.target.value)}
            />
            <Button
              onClick={() => handleAddResource()}
              loading={isCreateResourceLoading}
            >
              Add
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default AuthzResourceManagement;
