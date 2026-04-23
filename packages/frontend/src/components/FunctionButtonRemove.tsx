import tw from 'tailwind-styled-components';
import FunctionButton from './FunctionButton';

const FunctionButtonRemove = tw(FunctionButton)`
bg-secondary-dark
text-secondary-contrast-min
border-secondary-darker
border-1
${(p) =>
  p.loading !== true
    ? `hover:bg-secondary-darkest
    hover:text-secondary-contrast-min`
    : ''}
`;

export default FunctionButtonRemove;
