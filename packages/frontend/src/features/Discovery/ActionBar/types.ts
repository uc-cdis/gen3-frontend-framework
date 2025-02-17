export interface DataActionFunctionProps<
  T extends Record<string, any> = Record<string, any>,
> {
  selectedResources: Array<T>;
  manifestFieldName?: string;
}

export type DataActionFunction = (props: DataActionFunctionProps) => void;
