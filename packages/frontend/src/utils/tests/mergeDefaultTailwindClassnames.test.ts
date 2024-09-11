import { mergeDefaultTailwindClassnames } from '../mergeDefaultTailwindClassnames';
import { StylingOverrideWithMergeControl } from '../../types';

describe('mergeDefaultTailwindClassnames function', () => {
  const defaultValues = {
    root: 'bg-gray-500 px-2 mr-8',
    label: 'text-white font-bold',
  };

  it('merges default and user-defined classnames', () => {
    const userValues: StylingOverrideWithMergeControl = {
      root: 'bg-blue-600',
      label: 'text-black',
      mode: 'merge',
    };
    expect(mergeDefaultTailwindClassnames(defaultValues, userValues)).toEqual({
      root: 'px-2 mr-8 bg-blue-600',
      label: 'font-bold text-black',
    });
  });

  it('replaces default classnames with user-defined', () => {
    const userValues: StylingOverrideWithMergeControl = {
      root: 'bg-blue-600',
      label: 'text-black',
      mode: 'replace',
    };
    expect(mergeDefaultTailwindClassnames(defaultValues, userValues)).toEqual({
      root: userValues.root,
      label: userValues.label,
    });
  });
});
