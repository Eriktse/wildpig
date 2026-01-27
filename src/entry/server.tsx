import { renderToReadableStream } from "react-dom/server"
import { createStaticHandler, createStaticRouter } from "react-router"
import routes from "../router";


const { App } = await import("../../../../src/App"!);



export const render = async (req: Request, serverData?: any): Promise<string> => {
    // 1. 创建处理器
    const { query, dataRoutes } = createStaticHandler(routes);
    
    // 2. 生成 context（自动执行所有 loader）
    const context = await query(new Request(req.url))
    
    // 3. 处理重定向/错误
    if (context instanceof Response) {
        throw "异常，请检查路由配置，确保前后端路由无冲突";
    }
    
    // 4. 创建静态路由
    const router = createStaticRouter(dataRoutes, context)
    const stream = await renderToReadableStream(<App router={router} serverData={serverData}/>)
    let result = '';
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done)break;
        // value是Uint8Array类型，我们需要将其解码为字符串
        result += decoder.decode(value);
    }

    return result;
}