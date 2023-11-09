import React from 'react';
import { NavigationProps } from './types';
import NavigationLogo from './NavigationLogo';
import NavigationBarButton from './NavigationBarButton';

const NavigationBar: React.FC<NavigationProps> = ({
  logo = undefined,
  items,
}: NavigationProps) => {
  return (
    <div className="flex flex-row border-b-1 bg-gen3-white border-gen3-smoke">
      <div className="flex flex-row items-center align-middle font-heading font-bold tracking-wide text-xl ml-[20px] mr-[20px]">
        {logo && <NavigationLogo {...{ ...logo }} />}
      </div>
      <div className="flex-grow">{/* middle section of header */}</div>
      <div className="flex flex-row pl-[30px] pr-[20px] ">
        {items.map((x, index) => {
          return (
            <div key={`${x.name}-${index}`}>
              <div className="border-l-1 border-gen3-smoke">
                <NavigationBarButton
                  tooltip={x.tooltip}
                  icon={x.icon}
                  href={x.href}
                  name={x.name}
                />
              </div>
            </div>
          );
        })}
        <div className="border-l-1 border-gray-400 opacity-80" />
      </div>
    </div>
  );
};

export default NavigationBar;
