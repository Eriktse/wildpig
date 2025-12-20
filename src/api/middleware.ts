


export const middleware = async (req: Request, next: (req: Request) => Promise<Response>) => {
    const response = await next(req);

    // response.headers.set("Middleware-Message", "Hello, I am middleware of Wildpig!");
    return response;
}