import {
  convertFilterSetToGqlFilter,
  fetchFencePresignedURL,
  type FilterSet,
} from '@gen3/core';
import {
  type JobBuilderAction,
  type SendJobOutputAction,
  SendResultsActionNotFoundError,
  SowerJobNotFoundError,
} from './types';

const PRESIGNED_URL_TEMPLATE_VARIABLE = '{{PRESIGNED_URL}}';
interface SendPFBToURLParameters {
  targetURLTemplate: string;
  guid: string;
}

const isSendPFBToURLParameters = (
  value: unknown,
): value is SendPFBToURLParameters => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    'targetURLTemplate' in candidate &&
    typeof candidate.targetURLTemplate === 'string'
  );
};

export const sendPFBToURL: SendJobOutputAction = async ({
  parameters,
  onDone = () => null,
  onError = () => null,
  onAbort = () => null,
  signal = undefined,
}) => {
  if (!isSendPFBToURLParameters(parameters)) {
    onError(new Error('Invalid parameters for sendPFBToURL action'));
    return;
  }
  const { targetURLTemplate, guid } = parameters as SendPFBToURLParameters;

  // get the presigned URL for the selected PFB
  try {
    const presignedURL = await fetchFencePresignedURL({
      guid: guid,
      onAbort: onAbort,
      signal: signal,
    });
    // the PFB export target URL is a template URL that should have a {{PRESIGNED_URL}} template
    // variable in it.
    const signedURL = encodeURIComponent(presignedURL);
    const targetURL = targetURLTemplate.replace(
      PRESIGNED_URL_TEMPLATE_VARIABLE,
      signedURL,
    );
    return new Promise<void>(() => {
      if (window) window.open(targetURL, '_blank', 'noopener,noreferrer');
      if (onDone) onDone();
    });
  } catch (e: unknown) {
    return new Promise<void>(() => {
      onError(e as Error);
    });
  }
};

class SowerJobBuilderActionFactory {
  private static actions = new Map<string, JobBuilderAction>();

  static register(name: string, action: JobBuilderAction) {
    this.actions.set(name, action);
  }

  static getAction(name: string) {
    const action = this.actions.get(name);
    if (!action) {
      throw new Error(`Action ${name} not found`);
    }
    return action;
  }
}

class SendSowerJobOutputActionFactory {
  private static actions = new Map<string, SendJobOutputAction>();

  static register(name: string, action: SendJobOutputAction) {
    this.actions.set(name, action);
  }

  static getAction(name: string) {
    const action = this.actions.get(name);
    if (!action) {
      throw new Error(`Action ${name} not found`);
    }
    return action;
  }
}

interface BuildPFBFromCohortParams extends Record<string, unknown> {
  filter: FilterSet;
  index: string;
}

/**
 * Creates an export to PFB action to submit to sower
 * @param params
 */
const buildPFBFromCohort: JobBuilderAction = (params) => {
  const { filter, index } = params as BuildPFBFromCohortParams;
  return {
    action: 'export',
    input: {
      filters: convertFilterSetToGqlFilter(filter),
      root_node: index,
    },
  };
};

SowerJobBuilderActionFactory.register(
  'export-cohort-to-pfb',
  buildPFBFromCohort,
);

SendSowerJobOutputActionFactory.register('handoff-pfb-to-url', sendPFBToURL);

/**
 *  find the action to create a job (e.g., get the correct data)
 * @param actionName
 */
export const findCreateJobAction = (actionName: string): JobBuilderAction => {
  try {
    return SowerJobBuilderActionFactory.getAction(actionName);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Cannot find create job action ${actionName}`);
    }
    throw new SowerJobNotFoundError(
      `Cannot find create job action ${actionName}`,
    );
  }
};

export const findSendResultsAction = (
  actionName: string,
): SendJobOutputAction => {
  try {
    return SendSowerJobOutputActionFactory.getAction(actionName);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error binding send results action ${actionName}`);
    }
    throw new SendResultsActionNotFoundError(
      `Cannot find send results action ${actionName}`,
    );
  }
};
