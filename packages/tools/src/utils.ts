export interface Args {
  [key: string]: string | boolean | undefined;
}

export const getArgs = <T extends Args>(defaults: T): T => {
  const args: T = { ...defaults };

  process.argv.slice(2, process.argv.length).forEach((arg) => {
    // long arg
    if (arg.slice(0, 2) === '--') {
      const longArg = arg.split('=');
      const longArgFlag = longArg[0].slice(2, longArg[0].length);
      const longArgValue = longArg.length > 1 ? longArg[1] : true;
      args[longArgFlag as keyof T] = longArgValue as T[keyof T];
    }
    // flags
    else if (arg[0] === '-') {
      const flags = arg.slice(1, arg.length).split('');
      flags.forEach((flag) => {
        args[flag as keyof T] = true as T[keyof T];
      });
    }
  });

  return args;
};
