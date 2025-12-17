import chalk from "chalk";
// import { routes, metaRoutes } from "./prepareRoutes";
import { readFileSync } from "node:fs";
import { getApiRouteModules } from "./apiRoutes";
import { renderToReadableStream } from "react-dom/server";
import devHtml from "../public/devHtml.html"

import { createStaticHandler, createStaticRouter, matchRoutes } from "react-router";


// 用户代码
import pageRoutes from "#/src/router/routes";
import { App } from "@/App"

const env = process.env;
const isDev = env.NODE_ENV === "development";

const apiModules = await getApiRouteModules(isDev ? "dev" : "prod") as any;

if(isDev){
    setTimeout(() => {import("../public/render")}, 0);
    /** 打包js */
    await Bun.build({
        entrypoints: ["./public/render.tsx"],
        outdir: "./public",
        format: "esm",
        minify: false,
    });
}


export const startServer = () => {
    Bun.serve({
        port: env.PORT || 3000,
        hostname: env.HOST || "0.0.0.0",
        routes:{
            ...apiModules,
            "/favicon.ico": () => new Response(Bun.file("./public/favicon.ico"), {
                headers: {
                    "content-type": "image/x-icon",
                }
            }),
            "/render.js": () => new Response((readFileSync("./public/render.js")), {
                headers: {
                    "Content-Type": "text/javascript; charset=utf-8",
                    "Cache-Control": isDev ? "no-cache" : "public, max-age=31536000, immutable"
                }
            }),
            "/*": isDev ? devHtml : async (request: Request) => {
                // 判断pathname是否匹配pageRoutes
                const url = new URL(request.url);
                const matches = matchRoutes(pageRoutes, url.pathname);
                if(!matches){
                    return new Response("404 Not Found", {
                        status: 404,
                        headers: {
                            "content-type": "text/plain; charset=utf-8",
                            "Access-Control-Allow-Origin": "*",
                        }
                    })
                }

                let { query, dataRoutes } = createStaticHandler(pageRoutes);
                let context = await query(request);
                if (context instanceof Response) return context;
                let router = createStaticRouter(dataRoutes, context);

                // 请求服务端数据
                const matchRoute = matches.at(-1)!;
                console.log(matchRoute);
                let serverDataApi = matchRoute.route.serverDataApi;
                const getServerData = async () => {
                    if(!serverDataApi)return undefined;
                    // 需要请求服务端数据， 替换动态参数
                    for(const [key, value] of Object.entries(matchRoute.params)){
                        if(value)serverDataApi = serverDataApi.replace(":" + key, value);
                    }
                    const pathname = serverDataApi.split("?")[0]; // 获取路径

                    const handler = apiModules[pathname];
                    if(handler){
                        const serverDataResponse = await handler.GET(request) as Response;
                        return await serverDataResponse.json();
                    }else{
                        console.debug("No handler for pathname: ", pathname);
                    }
                }
                let serverData = await getServerData();
                console.debug("serverData: ", serverData);


                const stream = await renderToReadableStream(<App router={router} serverData={serverData} />);
                return new Response(stream, {
                    headers: {
                        "content-type": "text/html; charset=utf-8",
                        "Access-Control-Allow-Origin": "*",
                    }
                })
            },
        },
        development: isDev
    })
    console.clear();
console.log(` __        __ _  _      _   ____   _        
 \\ \\      / /(_)| |  __| | |  _ \\ (_)  __ _ 
  \\ \\ /\\ / / | || | / _\` | | |_) || | / _\` |
   \\ V  V /  | || || (_| | |  __/ | || (_| |
    \\_/\\_/   |_||_| \\__,_| |_|    |_| \\__, |
                                      |___/ `)
    console.log(chalk.blue.bgGreen("         🐗 WildPig version 1.1.6 by eriktse       "));
    console.log(chalk.green("          Strong & Fast Fullstack Framework\n"));
    console.log(chalk.green("✨ WildPig is running on port " + env.PORT || 3000));
    if(isDev){
        console.log(chalk.yellow("💻 Wildpig is Running in development mode."));
    }else{
        console.log(chalk.green("💻 Wildpig is Running in production mode."));
    }
    console.log(chalk.green("🔗 Click to debug in Browser: http://localhost" + ":" + (env.PORT || 3000)));
}