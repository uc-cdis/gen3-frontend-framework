export class SowerJobNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SowerJobNotFoundError';
  }
}

export class SendResultsActionNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SendResultsActionNotFoundError';
  }
}
