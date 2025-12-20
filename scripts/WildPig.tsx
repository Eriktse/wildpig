import chalk from "chalk";
// import { routes, metaRoutes } from "./prepareRoutes";
import { readFileSync } from "node:fs";
import { getApiRouteModules } from "./apiRoutes";
import { renderToReadableStream } from "react-dom/server";
import devHtml from "../public/devHtml.html"

import { createStaticHandler, createStaticRouter, matchRoutes } from "react-router";


const __dirname = import.meta.dirname;


// 用户代码
import pageRoutes from "#/src/router/routes";
import { App } from "@/App"
import path from "node:path";

const env = process.env;
const port = env.PORT || 3000;
const hostname = env.HOSTNAME || "localhost";
const isDev = env.NODE_ENV === "development";

const apiModules = await getApiRouteModules(isDev ? "dev" : "prod") as any;


if(isDev){
    setTimeout(() => {import("../public/render")}, 0);
    /** 打包js */
    await Bun.build({
        entrypoints: [path.resolve(__dirname, "../public/render.tsx")],
        outdir: path.resolve(__dirname, "../public"),
        format: "esm",
        minify: false,
    });
}

export const startServer = async () => {
    Bun.serve({
        port,
        hostname,
        routes:{
            ...apiModules,
            // 这个来自用户文件
            "/favicon.ico": () => new Response(Bun.file("./public/favicon.ico"), {
                headers: {
                    "content-type": "image/x-icon",
                }
            }),
            "/render.js": () => new Response((readFileSync(path.resolve(__dirname, "../public/render.js"))), {
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
                let serverDataApi = matchRoute.route.serverDataApi;
                const getServerData = async () => {
                    if(!serverDataApi)return undefined;
                    // 需要请求服务端数据， 替换动态参数
                    for(const [key, value] of Object.entries(matchRoute.params)){
                        if(value)serverDataApi = serverDataApi.replace(":" + key, value);
                    }
                    const pathname = serverDataApi.split("?")[0]; // 获取路径
                    const handleUrl = "http://" + hostname + ":" + port + pathname;
                    const serverData = await fetch(handleUrl).then(r => r.json());
                    return serverData;
                };
                let serverData = await getServerData();


                const stream = await renderToReadableStream(<App router={router} serverData={serverData} />);
                return new Response(stream, {
                    headers: {
                        "content-type": "text/html; charset=utf-8",
                        "Access-Control-Allow-Origin": "*",
                    }
                })
            },
        },
        development: isDev,
        
    })
}