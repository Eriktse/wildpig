import { getApiRouteModules } from "./apiRoutes";
import fs from "node:fs";
import { matchRoutes } from "react-router";
import packageJson from "../package.json";
import { ICreateServerOptions } from "./types";
import { routes } from "../router";
const env = process.env;
// 用户代码（动态导入）
import chalk from "chalk";

const getPackageInfo = async () => {
    return packageJson;
}
const packageInfo = await getPackageInfo();

/** 启动后的描述性文字 */
const afterStart = (options: ICreateServerOptions) => {
// 启动后的文字
console.log(` __        __ _  _      _   ____   _        
 \\ \\      / /(_)| |  __| | |  _ \\ (_)  __ _ 
  \\ \\ /\\ / / | || | / _\` | | |_) || | / _\` |
   \\ V  V /  | || || (_| | |  __/ | || (_| |
    \\_/\\_/   |_||_| \\__,_| |_|    |_| \\__, |
                                      |___/ `)
console.log(chalk.blue.bgGreen(`         🐗 WildPig version ${packageInfo?.version} by ${packageInfo?.author}       `));
console.log(chalk.green("          Strong & Fast Fullstack Framework\n"));
console.log(chalk.green("✨ WildPig is running on port " + env.PORT || 3000));
console.log(chalk.green("💻 Wildpig is Running in production mode."));
console.log(chalk.green(`🔗 Click to play in Browser: http://localhost:${options.port}`));
}

export default async (options?: ICreateServerOptions) => {
    options = Object.assign({
        port: 3000,
        host: "0.0.0.0",
        showInfo: true,
    }, options || {});

    
    const apiModules = await getApiRouteModules("prod") as any;
    const server = Bun.serve({
        port: options.port,
        hostname: options.host,
        routes:{
            ...apiModules,
            "/*": async (request: Request) => {
                // 判断pathname是否匹配pageRoutes
                const url = new URL(request.url);
                if(url.pathname.includes(".") || url.pathname.startsWith("/@") || url.pathname.startsWith("/assets")){
                    const filepath = "./client" + url.pathname;
                    // 检查文件是否存在
                    if(fs.existsSync(filepath) && fs.statSync(filepath).isFile()){
                        return new Response(Bun.file(filepath), {
                            headers: {
                                "Cache-Control": "public, max-age=864000" // 10 天缓存
                            }
                        });
                    }
                    // 文件不存在
                    return new Response("Not Found", {status: 404});
                }

                // 请求服务端数据
                const matches = matchRoutes(routes, url.pathname);
                if(!matches)return new Response("Not Found", {status: 404});

                const matchRoute = matches.at(-1)!;
                let serverDataApi = matchRoute.route.serverDataApi;
                const getServerData = async () => {
                    if(!serverDataApi)return undefined;
                    const prefixUrl = request.url.split("/")[0] + "//" + request.url.split("/")[2];
                    // 需要请求服务端数据， 替换动态参数
                    for(const [key, value] of Object.entries(matchRoute.params)){
                        if(value)serverDataApi = serverDataApi.replace(":" + key, value);
                    }
                    // 加上当前request的query参数
                    for(const [key, value] of new URLSearchParams(request.url.split("?")[1]).entries()){
                        if(serverDataApi.includes(key + "="))continue; // 已经有这个参数了
                        serverDataApi += (serverDataApi.includes("?") ? "&" : "?") + key + "=" + value;
                    }
                    const serverRequest = new Request({
                        ...request.clone(),
                        url: prefixUrl + serverDataApi, // 替换url
                    });
                    serverRequest.headers.set("wildpig-server-data-api", serverDataApi);
                    const pathname = serverDataApi.split("?")[0]; // 获取路径
                    const handler = apiModules?.[pathname]?.GET;
                    if(!handler)return undefined; // 没有对应的handler
                    const serverData = await handler(serverRequest).then((r: Response) => r.json());
                    return serverData;
                };
                let serverData = await getServerData();

                // 1. 读取 index.html
                const template = fs.readFileSync('./client/index.html', 'utf-8');
                // 2. 获取渲染函数
                const { render } = await import("../entry/server"!);
                // 3. 获取应用程序 HTML
                const appHtml = await render(request, serverData);

                // 4. 注入渲染后的应用程序 HTML 到模板中。
                const html = template
                    .replace(`<!--ssr-outlet-->`, () => appHtml)
                    .replace(`<!--title-->`, () => serverData?.title || "title")
                    .replace(`<!--server-data-->`, () => `<script>window.__SERVER_DATA__ = ${JSON.stringify(serverData)};</script>`);

                return new Response(html, {
                    headers: {
                        "content-type": "text/html; charset=utf-8",
                        "Access-Control-Allow-Origin": "*",
                    }
                });
            },
        },
        development: false,
    });
    if(options.showInfo)afterStart(options);
    return server;
}