




export const middleware = async (req: Request, next: (req: Request) => Promise<Response>) => {
    console.log("middleware: ", req.url);
    
    const response = await next(req);
    
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
}