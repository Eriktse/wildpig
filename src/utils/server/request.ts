








export const getQueryObjectFromRequest = (req: Request) => {
    const params = new URLSearchParams(req.url.split("?")[1]);
    const queryObject: { [key: string]: string } = {};
    params.forEach((value, key) => {
        queryObject[key] = value;
    });
    return queryObject;
}

export const getBodyFromRequest = async (req: Request) => {
    if(req.method === "GET")return {};
    
    try{
        const body = await req.json();
        return body;
    }catch(e){
        throw "请求体格式错误";
    }
}