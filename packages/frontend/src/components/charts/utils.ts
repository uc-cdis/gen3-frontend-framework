export const capitalize = (original: string): string => {

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
    const tokens = label.split(' ');
    const capitalizedTokens = tokens.map((s) => capitalize(s));
    return capitalizedTokens.join(' ');
};
