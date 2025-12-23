import { readFileSync } from "node:fs";
import { getApiRouteModules } from "./apiRoutes";
import { createServer as createViteServer } from "vite";
import { createStaticHandler, createStaticRouter, matchRoutes } from "react-router";


const __dirname = import.meta.dirname;


// 用户代码
import pageRoutes from "#/src/router/routes";
import path from "node:path";

const env = process.env;
const port = env.PORT || 3000;
const hostname = env.HOST || env.HOSTNAME || "localhost";
const isDev = env.NODE_ENV === "development";

let viteServer = null;
if(isDev){
    // 启动vite server
    viteServer = await createViteServer({
        configFile: path.resolve(__dirname, "../vite.config.ts"),
    });
    await viteServer.listen(5173);
}

export const startServer = async () => {
    // 确保重启后可以重新拿到路由
    const apiModules = await getApiRouteModules(isDev ? "dev" : "prod") as any;
    return Bun.serve({
        port,
        hostname,
        routes:{
            ...apiModules,
            "/*": async (request: Request) => {

                // 如果是开发环境，直接转发给vite server
                if(isDev){
                    const viteURL = new URL(request.url);
                    viteURL.port = "5173";
                    const response = await fetch(viteURL.toString());
                    return response;
                }

                // 判断pathname是否匹配pageRoutes
                // const url = new URL(request.url);
                // const matches = matchRoutes(pageRoutes, url.pathname);
                // if(!matches){
                //     return new Response("404 Not Found", {
                //         status: 404,
                //         headers: {
                //             "content-type": "text/plain; charset=utf-8",
                //             "Access-Control-Allow-Origin": "*",
                //         }
                //     })
                // }

                // let { query, dataRoutes } = createStaticHandler(pageRoutes);
                // let context = await query(request);
                // if (context instanceof Response) return context;
                // let router = createStaticRouter(dataRoutes, context);

                // // 请求服务端数据
                // const matchRoute = matches.at(-1)!;
                // let serverDataApi = matchRoute.route.serverDataApi;
                // const getServerData = async () => {
                //     if(!serverDataApi)return undefined;
                //     const prefixUrl = request.url.split("/")[0] + "//" + request.url.split("/")[2];
                //     // 需要请求服务端数据， 替换动态参数
                //     for(const [key, value] of Object.entries(matchRoute.params)){
                //         if(value)serverDataApi = serverDataApi.replace(":" + key, value);
                //     }
                //     // 加上当前request的query参数
                //     for(const [key, value] of new URLSearchParams(request.url.split("?")[1]).entries()){
                //         if(serverDataApi.includes(key + "="))continue; // 已经有这个参数了
                //         serverDataApi += (serverDataApi.includes("?") ? "&" : "?") + key + "=" + value;
                //     }
                //     const serverRequest = new Request({
                //         ...request.clone(),
                //         url: prefixUrl + serverDataApi, // 替换url
                //     });
                //     serverRequest.headers.set("wildpig-server-data-api", serverDataApi);
                //     const pathname = serverDataApi.split("?")[0]; // 获取路径
                //     const serverData = await apiModules[pathname].GET(serverRequest).then((r: Response) => r.json());
                //     return serverData;
                // };
                // let serverData = await getServerData();

                // return new Response("Production HTML", {
                //     headers: {
                //         "content-type": "text/html; charset=utf-8",
                //         "Access-Control-Allow-Origin": "*",
                //     }
                // })
            },
        },
        development: isDev,
        
    })
}