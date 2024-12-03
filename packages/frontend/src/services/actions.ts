import { ActionFunction } from '@gen3/core';
import { ActionParams } from '@gen3/core/dist/dts';

/*
 * Stragey is have function have build the parameters for sower
 * and use those to submit. Then once the job is complete have another action
 * that does something with the newly created PFB.
 */

const exportCohortToPFB: ActionFunction = ({
  parameters,
  onError,
}: ActionParams) => {
  return {};
};
