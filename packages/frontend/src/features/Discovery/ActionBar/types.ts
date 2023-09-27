

export interface ActionButtonProps<T extends Record<string, any> = Record<string, any>> {
  selectedResources: Array<T>;
  manifestFieldName?: string;
}
