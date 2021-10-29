import React, { PropsWithChildren } from "react";
import { Provider } from "react-redux";

import { coreStore } from "./store";

export const CoreProvider: React.FC<unknown> = ({
  children,
}: PropsWithChildren<unknown>) => {
  return (
    <Provider store={coreStore} >
      {children}
    </Provider>
  );
};
