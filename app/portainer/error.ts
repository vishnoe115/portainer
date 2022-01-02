export default class PortainerError extends Error {
  msg: string;

  err?: Error;

  constructor(msg: string, err?: Error) {
    super(msg);
    this.msg = msg;
    this.err = err;
  }
}
