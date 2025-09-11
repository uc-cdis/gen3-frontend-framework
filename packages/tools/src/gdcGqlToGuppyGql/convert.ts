import { Args, getArgs } from '../utils';
import { convertGDCFilterToGen3Filter } from './converter';

interface ConverterArgs extends Args {
  query: string;
}

const main = async () => {
  console.log('Starting');
  try {
    const { query }: ConverterArgs = getArgs({
      query: '',
    });

    if (!query) {
      console.log('No query provided');
      return;
    }

    console.log('query', query);
    const gdcQuery = JSON.parse(query);

    console.log(gdcQuery);
    const gen3Query = convertGDCFilterToGen3Filter(gdcQuery);
    console.log(gen3Query);
  } catch (e) {
    console.log('Invalid query');
  }
};

main();
