interface ResourceEntry {
  value: string;
  label: string;
  children?: Array<ResourceEntry>;
}

interface ResourceTreeBuilderData extends Omit<ResourceEntry, 'children'> {
  children: Record<string, ResourceTreeBuilderData>;
  _hasChildren: boolean;
}

export const convertPathsToTree = (paths: Array<string>) => {
  const tree: Record<string, ResourceTreeBuilderData> = {};

  paths.forEach((path) => {
    const parts = path.split('/').filter((part) => part !== '');
    let current = tree;

    // Build the path through the tree
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const fullPath = parts.slice(0, i + 1).join('/');

      if (!current[part]) {
        current[part] = {
          value: fullPath,
          label: part,
          children: {},
          _hasChildren: false,
        };
      }

      // Mark parent as having children
      if (i < parts.length - 1) {
        current[part]._hasChildren = true;
      }

      current = current[part].children;
    }
  });

  // Convert to final format
  const convertToFinalFormat = (node: ResourceTreeBuilderData) => {
    const result: ResourceEntry = {
      value: node.value,
      label: node.label,
    };

    const childKeys = Object.keys(node.children);
    if (childKeys.length > 0) {
      result.children = childKeys.map((key) =>
        convertToFinalFormat(node.children[key]),
      );
    }

    return result;
  };

  // Get the root nodes and convert them
  const rootKeys = Object.keys(tree);
  return rootKeys.map((key) => convertToFinalFormat(tree[key]));
};
