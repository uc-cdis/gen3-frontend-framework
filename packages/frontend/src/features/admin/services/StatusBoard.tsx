import React, { useState } from 'react';
import {
  LuActivity as Activity,
  LuRefreshCw as RefreshCw,
} from 'react-icons/lu';

const overallHealthy = true;

const StatusBoard = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    setLastRefresh(new Date());
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <div className="min-h-screen b-base-min">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-secondary-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center">
                <Activity size={16} color="#fff" strokeWidth={2.5} />
              </div>
              <div>
                <h1
                  className="text-base font-bold tracking-tight"
                  style={{ color: '#E8EAF0' }}
                >
                  Gen3 Services Status
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-xs tabular-nums hidden sm:block"
                style={{ color: '#4B5563', fontFamily: 'monospace' }}
              >
                {lastRefresh.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
              </span>
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    'rgba(255,255,255,0.05)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <RefreshCw
                  size={14}
                  style={spinning ? { animation: 'spin-once 0.8s ease' } : {}}
                />
              </button>
            </div>
          </div>
        </div>
      </header>
      <div>Gen3 Service Status</div>
    </div>
  );
};

export default StatusBoard;
