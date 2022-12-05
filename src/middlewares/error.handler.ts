import { Request, Response, NextFunction } from 'express';

export function logErrors(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('logErrors');
  console.error(err);
  next(err);
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('errorHandler');
  res.status(500).json({
    message: err.message,
    // stack: err.stack  //me estaba dando los datos de la pc en los request ,,peligroso
  });
  next(err);
}

export function boomErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  }
  next(err);
}
