import React from 'react';
import Image from 'next/image';
import { Container, Grid, Anchor, Text, Group, Stack } from '@mantine/core';

export const CustomFooter = () => {
  return (
    <div style={{ backgroundColor: '#f8f9fa', padding: '20px 0' }}>
      <Container>
        <Grid justify="space-between" align="center">
          {/* Left side - Links */}
          <Grid.Col span={6}>
            <Stack gap="md" justify="flex-start">
              <Anchor href="#" size="sm">
                Home
              </Anchor>
              <Anchor href="#" size="sm">
                About
              </Anchor>
              <Anchor href="#" size="sm">
                Services
              </Anchor>
              <Anchor href="#" size="sm">
                Contact
              </Anchor>
              <Anchor href="#" size="sm">
                Privacy Policy
              </Anchor>
            </Stack>
          </Grid.Col>

          {/* Right side - Logos/Graphics */}
          <Grid.Col span={6}>
            <Group justify="flex-end">
              {/* Placeholder for logos */}
              <Image
                src="/images/createdby.png"
                alt="created by CTDS at the University of Chicago"
                width={40}
                height={40}
              />
              <Image
                src="/images/gen3.png"
                alt="Gen3 Logo"
                width={40}
                height={40}
              />
            </Group>
          </Grid.Col>
        </Grid>

        {/* Footer bottom text */}
        <Text ta="center" size="sm" style={{ marginTop: '20px' }}>
          A Gen3 Data Commons
        </Text>
      </Container>
    </div>
  );
};

export default CustomFooter;
