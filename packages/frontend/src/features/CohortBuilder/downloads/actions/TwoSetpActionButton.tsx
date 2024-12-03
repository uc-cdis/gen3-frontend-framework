import {
  ActionParams,
  convertFilterSetToGqlFilter,
  FilterSet,
} from '@gen3/core';

type JobBuilderAction = (
  params: Record<string, unknown>,
) => Record<string, unknown>;

type SendJobOutputrAction = (
  params: ActionParams<Record<string, unknown>>,
) => Promise<void>;

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
  private static actions = new Map<string, SendJobOutputrAction>();

  static register(name: string, action: SendJobOutputrAction) {
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
  action: string;
  filters: FilterSet;
  index: string;
}

const buildPFBFromCohort: JobBuilderAction = (params) => {
  const { action, filters, index } = params as BuildPFBFromCohortParams;
  return {
    action: action,
    input: {
      filters: convertFilterSetToGqlFilter(filters),
      root_node: index,
    },
  };
};

interface HandoffPFBToTemplatedURLParams extends Record<string, unknown> {
  url: string;
  pfbId: string;
}

SowerJobBuilderActionFactory.register(
  'export-cohort-to-pfb',
  buildPFBFromCohort,
);

const TwpStepActionButton = () => {
  return <div></div>;
};
