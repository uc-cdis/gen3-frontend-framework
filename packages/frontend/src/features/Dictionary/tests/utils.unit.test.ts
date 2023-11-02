import data_dictionary from '../data/dictionary.json';
import { category2NodeList, getNodePropertyCount } from '../utils';

// note the use of data_dictionary will change to a mock data dictionary at some point
// TODO create a mock data dictionary and use that instead of the real one

describe('Data Dictionary Table Utils Test', () => {
  it('category2NodeList ', () => {
    const result = category2NodeList(data_dictionary);
    expect(result).toBeDefined();
  });

  it('getNodePropertyCount', () => {
    const result = getNodePropertyCount(data_dictionary);
    expect(result).toEqual({ nodesCount: 34, propertiesCount: 1445 });
  });
});
