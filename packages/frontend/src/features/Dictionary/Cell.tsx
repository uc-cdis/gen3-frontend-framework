import React from 'react';

const Cell = ({ cell, key }: { cell: any; key: string }) => {
  return (
    <div>
      {key === 'type' ? (
        <>
          {
            <ul>
              {(cell.getValue()?.split(' ') || []).map((cell: any, index:number) => {
                return <li key={`${key}-${index}`}>{cell}</li>;
              })}
            </ul>
          }
        </>
      ) : (
        <span>{cell.getValue()}</span>
      )}
    </div>
  );
};

export default Cell;
