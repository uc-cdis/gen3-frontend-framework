import React from 'react';

const Cell = ({ cell, key }: { cell: any; key: string }) => {
  return (
    <div>
      {key === 'type' ? (
        <React.Fragment>
          {
            <ul>
              {(cell.getValue()?.split(' ') || []).map(
                (cell: any, index: number) => {
                  return <li key={`cell-${index}`}>{cell}</li>;
                },
              )}
            </ul>
          }
        </React.Fragment>
      ) : (
        <span>{cell.getValue()}</span>
      )}
    </div>
  );
};

export default Cell;
