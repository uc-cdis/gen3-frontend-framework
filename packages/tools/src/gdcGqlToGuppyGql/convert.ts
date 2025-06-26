import { Args, getArgs } from '../utils';
import { convertGDCFilterToGen3Filter } from './converter';

interface ConverterArgs extends Args {
  query?: string;
}

const { query  }: ConverterArgs = getArgs({
  query: undefined,
});


const main = () => {

  if (!query) {
    console.log('No query provided');
    return;
  }
  try {
    const gdcQuery = JSON.parse(query);

    const gen3Query = convertGDCFilterToGen3Filter(gdcQuery);
    console.log(gen3Query);

  } catch (e) {
    console.log('Invalid query');
  }

}