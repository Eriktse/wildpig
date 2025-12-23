



export const middleware = (req: Request, next: (req: Request) => Promise<Response>) => {
    return next(req);
}