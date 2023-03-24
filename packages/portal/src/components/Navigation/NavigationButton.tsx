import React from "react";
import { Button, ButtonProps } from "@mantine/core";

type NavigationButtonProps = ButtonProps &
  React.ComponentPropsWithoutRef<"a"> & { $selected?: boolean };

// const NavigationButton = tw(Button)<NavigationButtonProps>`
//         subpixel-antialiased
//         shadow
//         rounded-lg
//         text-base
//         font-montserrat
//         font-medium
//         text-white
//         transition
//         hover:bg-heal-purple
//         hover:shadow-[0_4px_5px_0px_rgba(0,0,0,0.35)]
//         hover:border-white
//         hover:underline
// `;

const NavigationButton = ({ $selected, ...props }: NavigationButtonProps) => {
  return (
    <Button
      {...props}
      component="a"
      color={$selected ? "white" : "gray"}
      variant={$selected ? "filled" : "outline"}
      size="lg"
      className="subpixel-antialiased shadow rounded-lg text-base font-montserrat font-medium transition hover:bg-heal-purple hover:shadow-[0_4px_5px_0px_rgba(0,0,0,0.35)] hover:border-white hover:underline"
    />
  );
};

export default NavigationButton;
