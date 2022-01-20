import React from 'react'

export interface TopBarProps {
    readonly topItems: [Record<string, any>];
}

const TopBar: React.FC<TopBarProps> = () => {
    return (
        <div className='w-100'>
            <header className='top-bar__header'>
                <nav className='top-bar__nav'>
                </nav>
            </header>
        </div>
    );
};

export default TopBar;
