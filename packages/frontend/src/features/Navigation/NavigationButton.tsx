import React from 'react';
import { Button, ButtonProps } from '@mantine/core';
import Link from 'next/link';

export type NavigationButtonProps = ButtonProps &
  React.ComponentPropsWithoutRef<typeof Link> & { $selected?: boolean };

const NavigationButton = ({ $selected, ...props }: NavigationButtonProps) => {
  return (
    <Button
      {...props}
      component={Link}
      color={$selected ? 'white' : 'gray'}
      variant={$selected ? 'filled' : 'outline'}
      size="lg"
      role="navigation"
      className="subpixel-antialiased shadow rounded-lg text-base font-heading font-medium transition hover:bg-heal-purple hover:shadow-[0_4px_5px_0px_rgba(0,0,0,0.35)] hover:border-white hover:underline"
    />
  );
};

export default NavigationButton;
