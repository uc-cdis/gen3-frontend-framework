export const capitalize = (original: string): string => {

    if (!original) {
        throw new Error('capitalize: original is undefined');
    }
    if (original.length === 0) {
        return original;
    }
    return original
        .split(' ')
        .map(
            (word) =>
                `${word.charAt(0).toUpperCase()}${word.slice(1)}`,
        )
        .join(' ');
};


export const truncateString = (str: string, n: number): string => {
    if (str.length > n) {
        return str.substring(0, n) + '...';
    } else {
        return str;
    }
};

// from https://stackoverflow.com/questions/33053310/remove-value-from-object-without-mutation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const removeKey = (key:any, { [key]: _, ...rest }) => rest;

export const processLabel = (label: string): string => {
    return capitalize(label);
};

export const processRangeKeyLabel = (key: [number, number]): string => {
    return `${key[0]}-${key[1]}`;
}
