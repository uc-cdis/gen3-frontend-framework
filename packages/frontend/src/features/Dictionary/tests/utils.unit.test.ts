import data_dictionary from '../data/dictionary.json';
import { getPropertyCount } from "../utils";

// note the use of data_dictionary will change to a mock data dictionary at some point
// TODO create a mock data dictionary and use that instead of the real one

  it('get total number of properties in data dictionary', () => {
    const result = getPropertyCount(["data_file", "biospecimen", "medical_history", "administrative", "data_observations"], data_dictionary);
    expect(result).toEqual(1432);
  });
