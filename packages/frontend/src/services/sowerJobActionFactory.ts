class ActionFactory {
  private static actions = new Map<
    string,
    (params: Record<string, any>) => Promise<any>
  >();

  static register(
    name: string,
    action: (params: Record<string, any>) => Promise<any>,
  ) {
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
