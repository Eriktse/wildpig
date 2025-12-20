




export const middleware = async (req: Request, next: (req: Request) => Response | Promise<Response>): Promise<Response> => {
    
    const response = await next(req);
    
    // 跨域
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
}