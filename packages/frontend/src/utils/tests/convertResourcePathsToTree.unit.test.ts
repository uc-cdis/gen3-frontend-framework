import { convertPathsToTree } from '../convertResourcePathsToTree';

describe('convertPathsToTree', () => {
  test('converts simple paths with single root', () => {
    const paths = ['src/components', 'src/hooks'];
    const result = convertPathsToTree(paths);

    expect(result).toEqual([
      {
        value: 'src',
        label: 'src',
        children: [
          { value: 'src/components', label: 'components' },
          { value: 'src/hooks', label: 'hooks' },
        ],
      },
    ]);
  });

  test('handles multiple levels of nesting', () => {
    const paths = [
      'program/project1/a',
      'program/project1/b',
      'program/project2',
    ];
    const result = convertPathsToTree(paths);

    expect(result).toEqual([
      {
        value: 'program',
        label: 'program',
        children: [
          {
            value: 'program/project1',
            label: 'project1',
            children: [
              { value: 'program/project1/a', label: 'a' },
              { value: 'program/project1/b', label: 'b' },
            ],
          },
          { value: 'program/project2', label: 'project2' },
        ],
      },
    ]);
  });

  test('handles multiple root directories', () => {
    const paths = ['src/components', 'src/hooks', 'lib/utils', 'docs/readme'];
    const result = convertPathsToTree(paths);

    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        {
          value: 'src',
          label: 'src',
          children: [
            { value: 'src/components', label: 'components' },
            { value: 'src/hooks', label: 'hooks' },
          ],
        },
        {
          value: 'lib',
          label: 'lib',
          children: [{ value: 'lib/utils', label: 'utils' }],
        },
        {
          value: 'docs',
          label: 'docs',
          children: [{ value: 'docs/readme', label: 'readme' }],
        },
      ]),
    );
  });

  test('handles paths with leading slashes', () => {
    const paths = ['/src/components', '/src/hooks'];
    const result = convertPathsToTree(paths);

    expect(result).toEqual([
      {
        value: 'src',
        label: 'src',
        children: [
          { value: 'src/components', label: 'components' },
          { value: 'src/hooks', label: 'hooks' },
        ],
      },
    ]);
  });

  test('handles single path', () => {
    const paths = ['src/components'];
    const result = convertPathsToTree(paths);

    expect(result).toEqual([
      {
        value: 'src',
        label: 'src',
        children: [{ value: 'src/components', label: 'components' }],
      },
    ]);
  });

  test('handles empty array', () => {
    const paths: Array<string> = [];
    const result = convertPathsToTree(paths);

    expect(result).toEqual([]);
  });

  test('handles single level paths', () => {
    const paths = ['file1', 'file2', 'file3'];
    const result = convertPathsToTree(paths);

    expect(result).toEqual([
      { value: 'file1', label: 'file1' },
      { value: 'file2', label: 'file2' },
      { value: 'file3', label: 'file3' },
    ]);
  });

  test('handles complex nested structure', () => {
    const paths = [
      'src/components/ui/Button.jsx',
      'src/components/ui/Input.jsx',
      'src/components/layout/Header.jsx',
      'src/hooks/useAuth.js',
      'src/utils/helpers.js',
      'tests/unit/components.test.js',
    ];
    const result = convertPathsToTree(paths);

    expect(result).toHaveLength(2); // src and tests

    const srcNode = result.find((node) => node.label === 'src');
    expect(srcNode).toBeDefined();
    expect(srcNode?.children).toHaveLength(3); // components, hooks, utils

    const componentsNode = srcNode?.children?.find(
      (node) => node.label === 'components',
    );
    expect(componentsNode?.children).toHaveLength(2); // ui, layout
  });

  test('preserves order of paths at same level', () => {
    const paths = ['a/z', 'a/y', 'a/x'];
    const result = convertPathsToTree(paths);

    // The order should be preserved as they were added
    expect(result[0].children?.map((child) => child.label)).toEqual([
      'z',
      'y',
      'x',
    ]);
  });

  test('handles duplicate paths gracefully', () => {
    const paths = ['src/components', 'src/components', 'src/hooks'];
    const result = convertPathsToTree(paths);

    expect(result).toEqual([
      {
        value: 'src',
        label: 'src',
        children: [
          { value: 'src/components', label: 'components' },
          { value: 'src/hooks', label: 'hooks' },
        ],
      },
    ]);
  });
});
