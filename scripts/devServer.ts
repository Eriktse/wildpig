import { getApiRouteModules } from "./apiRoutes";
import { createServer as createViteServer } from "vite";
import { matchRoutes } from "react-router";
import fs from "node:fs";

const __dirname = import.meta.dirname;

// 用户代码
import path from "node:path";
import chalk from "chalk";
import { WildPigRouteObject } from "router/types";

const env = process.env;
const port = env.PORT || 3000;
const hostname = env.HOST || env.HOSTNAME || "localhost";


// 启动vite server
const viteServer = await createViteServer({
    configFile: path.resolve(__dirname, "../../../vite.config.ts"),
});
await viteServer.listen(viteServer.config.server.port);


const viteHandler = (apiModules: any) => async (request: Request) => {
    // 判断pathname是否匹配pageRoutes
    const url = new URL(request.url);

    // 判断是否是vite请求
    if(url.pathname.includes(".") || url.pathname.startsWith("/@")){
        // 没有匹配的route，说明是一些资源什么的
        const viteURL = new URL(request.url);
        viteURL.port = viteServer.config.server.port.toString();
        console.log("转发请求：" + viteURL.toString());
        const response = await fetch(viteURL.toString(), {
            method: request.method,
            headers: request.headers,
            body: request.body,
        });
        return response.clone();
    }

    const pageRoutes = (await viteServer.ssrLoadModule("@/router/routes.ts"!)).default as WildPigRouteObject[];
    const matches = matchRoutes(pageRoutes, url.pathname);
    if(!matches)return new Response("404 Not Found", { status: 404 });

    // 请求服务端数据
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
        const serverData = await apiModules[pathname].GET(serverRequest).then((r: Response) => r.json());
        return serverData;
    };
    let serverData = await getServerData();

    // 1. 读取 index.html
    const template = await viteServer.transformIndexHtml(request.url, fs.readFileSync('./index.html', 'utf-8'));
    // 2. 获取渲染函数
    const { render } = await viteServer.ssrLoadModule('/node_modules/wildpig/entry/server.tsx')
    // 3. 获取应用程序 HTML
    const appHtml = await render(request)

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
}


const getPackageInfo = async () => {
    const packageJson = await Bun.file(path.resolve(__dirname, "../package.json")).json();
    return packageJson;
}
const packageInfo = await getPackageInfo();

/** 启动后的描述性文字 */
const afterStart = () => {
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
console.log(chalk.yellow("💻 Wildpig is Running in development mode."));
console.log(chalk.green("⚡ Vite server is running on port " + viteServer.config.server?.port));
console.log(chalk.green(`🔗 Click to debug in Browser: http://${hostname}:${port}`));
}

export const startServer = async () => {
    // 确保重启后可以重新拿到路由
    const apiModules = await getApiRouteModules("dev") as any;
    console.log(apiModules)
    const server = Bun.serve({
        port,
        hostname,
        routes:{
            ...apiModules,
            "/*": viteHandler(apiModules),
        },
        development: true,
    })
    afterStart();
    return server;
}
startServer();