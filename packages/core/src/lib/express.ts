import { ErrorRequestHandler, NextFunction, Request, Response, RequestHandler } from "express"
import createError from "http-errors"

export const handle404Error: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    next(createError(404))
}

export const handleError: ErrorRequestHandler = (err, req: Request, res: Response) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get("env") === "development" ? err : {}

    // render the error page
    const status = err.status || 500
    let message = err.message
    if(process.env.NODE_ENV !== "production" && status >= 500){
        message = "Something went wrong"
    }

    res.status(status)
    res.json({
        ok: false,
        message,
    })

    // console.warn(err)
}

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const asyncHandler = (handler: AsyncHandler) => 
    (req: Request, res: Response, next: NextFunction) => 
        handler(req, res, next).catch(next)