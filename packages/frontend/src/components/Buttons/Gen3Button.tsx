import tw from 'tailwind-styled-components';

interface Gen3ButtonProps {
  colors: string;
}

export const Gen3Button = tw.div<Gen3ButtonProps>`
inline-block
text-center
px-2
py-2
text-accent-contrast-lighter
leading-[1.5]
font-semibold
uppercase
border-4
border-solid
border-transparent
rounded-[7px]
${(p) => `bg-${p.colors}`}
${(p) => `hover:bg-${p.colors}-max`}
`;

export const Gen3ButtonReverse = tw.div<Gen3ButtonProps>`
bg-base-max
text-accent-contrast
border-accent-lighter
inline-block
text-center
px-2
py-2
text-base
leading-[1.5]
font-semibold
uppercase
border-4
border-solid
rounded-[7px]
`;
