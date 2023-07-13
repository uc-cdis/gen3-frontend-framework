export interface CrosswalkInfo {
  readonly from: string;
  readonly to: string;
}

export interface CrosswalkArray {
  readonly mapping: ReadonlyArray<CrosswalkInfo>;
}

export interface CrosswalkParams {
  readonly ids: string;
  readonly fields: {
    from: string;
    to: string;
  };
}
