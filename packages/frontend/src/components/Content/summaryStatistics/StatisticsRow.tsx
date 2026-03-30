import React from 'react';
import StatisticsCell, { type StatisticsCellInfo } from './StatisticsCell';

const StatisticsRow = (stats: Array<StatisticsCellInfo>) => {
  return (
    <div
      className="grid border border-base-lightest divide-x divide-base-light"
      style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
    >
      {stats.map((stat, i) => (
        <StatisticsCell
          key={stat.label}
          info={stat}
          index={i}
          total={stats.length}
        />
      ))}
    </div>
  );
};

export default StatisticsRow;
