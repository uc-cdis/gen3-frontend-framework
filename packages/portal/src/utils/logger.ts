const logger = {
    log: (...args : any) => console.log(...args),
    warn: (...args: any) => console.warn(...args),
    error: (...args: any) => console.error(...args),
    debug: (...args: any) => console.debug(...args),
    info: (...args: any) => console.info(...args),
    table: (...args: any) => console.table(...args),
};

export default logger;
