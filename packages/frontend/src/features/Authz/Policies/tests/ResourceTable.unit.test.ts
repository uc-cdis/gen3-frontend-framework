import { buildResourcePaths } from '../PoliciesTable';
import { Resource } from '../../types';

describe('buildResourcePaths', () => {
  it('should return an array with the resource name when there are no subresources', () => {
    const resource: Resource = {
      name: 'resource1',
      subresources: [],
    };

    const result = buildResourcePaths(resource);

    expect(result).toEqual(['/resource1']);
  });

  it('should return an array with the resource name and subresource paths when there are subresources', () => {
    const resource: Resource = {
      name: 'resource1',
      subresources: [
        {
          name: 'subresource1',
          subresources: [],
        },
        {
          name: 'subresource2',
          subresources: [],
        },
      ],
    };

    const result = buildResourcePaths(resource);

    expect(result).toEqual([ '/resource1','/resource1/subresource1', '/resource1/subresource2']);
  });

  it('should handle nested subresources', () => {
    const resource: Resource = {
      name: 'resource1',
      subresources: [
        {
          name: 'subresource1',
          subresources: [
            {
              name: 'subsubresource1',
              subresources: [],
            },
          ],
        },
      ],
    };

    const result = buildResourcePaths(resource);

    expect(result).toEqual(['/resource1', '/resource1/subresource1','/resource1/subresource1/subsubresource1']);
  });

  it('should handle multiple nested subresources', () => {
const resource: Resource = {
      name: 'resource1',
      subresources: [
        {
          name: 'subresource1',
          subresources: [
            {
              name: 'subsubresource1',
              subresources: [],
            },
          ],
        },
        {
          name: 'subresource2',
          subresources: [
            {
              name: 'subsubresource2',
              subresources: [],
            },
          ],
        },
      ],
    };

    const result = buildResourcePaths(resource);

    expect(result).toEqual(['/resource1', '/resource1/subresource1','/resource1/subresource1/subsubresource1', '/resource1/subresource2','/resource1/subresource2/subsubresource2']);
  });

});
