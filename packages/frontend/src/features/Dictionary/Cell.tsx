
const Cell = ({ cell, key }: { cell: any, key: string }) => {
    return (<div>
        {key === 'type' ? (
            <div>
                {
                    <ul>
                        {(cell.getValue()?.split(' ') || []).map((cell: any, key: number) => {
                            return <li key={key}>{cell}</li>;
                        })}
                    </ul>
                }
            </div>
        ) : (
            <span>{cell.getValue()}</span>
        )}
    </div>);
};

export default Cell;
