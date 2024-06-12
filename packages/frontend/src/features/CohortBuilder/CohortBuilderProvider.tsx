import React, { createContext } from 'react';
import { CohortBuilderConfiguration, CohortPanelConfig } from './types';
import { JSONObject, useGetCSRFQuery } from '@gen3/core';
import { Loader } from '@mantine/core';

interface CohortBuilderProviderValue {
  config: Array<CohortPanelConfig>;
  setItemDetails: React.Dispatch<React.SetStateAction<JSONObject>>;
  itemDetails: JSONObject;
}

const CohortBuilderContext = createContext<CohortBuilderProviderValue>({
  config: [] as Array<CohortPanelConfig>,
  setItemDetails: () => null,
  itemDetails: {} as JSONObject,
});

const useCohortBuilderContext = () => {
  const context = React.useContext(CohortBuilderContext);
  if (context === undefined) {
    throw Error(
      'CohortBuilder must be used  must be used inside of a CohortBuilderContext',
    );
  }
  return context;
};

const CohortBuilderProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: Array<CohortPanelConfig>;
}) => {
  const [itemDetails, setItemDetails] = React.useState<JSONObject>({});
  const { isFetching, isError } = useGetCSRFQuery(); // need to have a CSRF token to add to the guppy calls

  return (
    <CohortBuilderContext.Provider
      value={{ config, setItemDetails, itemDetails }}
    >
      {isFetching ? (
        <div className="flex w-full py-24 relative justify-center">
          <Loader variant="dots" />{' '}
        </div>
      ) : null}
      {children}
    </CohortBuilderContext.Provider>
  );
};

export { useCohortBuilderContext, CohortBuilderProvider as default };
