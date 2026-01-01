import { getApiRouteModules } from "./apiRoutes";
import { createServer as createViteServer, type ViteDevServer} from "vite";
import { matchRoutes } from "react-router";
import fs from "node:fs";
import { WildPigRouteObject } from "../router/types";
import packageInfo from "../package.json";


const __dirname = import.meta.dirname;
const __rootdir = path.resolve(__dirname, "../../../");
import { ICreateServerOptions } from "./types";

const env = process.env;



// 用户代码
import path from "node:path";
import chalk from "chalk";


// 启动vite server
let viteServer: ViteDevServer;
if(env.NODE_ENV === "development"){
    viteServer = await createViteServer({
        configFile: path.resolve(__rootdir, "./vite.config.ts"),
    });
    await viteServer.listen(viteServer.config.server.port);
}


const frontHandler = (apiModules: any) => async (request: Request) => {
    // 判断pathname是否匹配pageRoutes
    const url = new URL(request.url);

    // 判断是否是vite请求
    if(url.pathname.includes(".") || url.pathname.startsWith("/@") || url.pathname.startsWith("/assets")){
        if(env.NODE_ENV === "development"){// 交给vite
            const viteURL = new URL(request.url);
            viteURL.port = viteServer.config.server.port.toString();
            const response = await fetch(viteURL.toString(), {
                method: request.method,
                headers: request.headers,
                body: request.body,
            });
            return response.clone();
        }else{// production环境，直接返回文件
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
    }



    // 服务端请求，获取服务端数据
    const routes = viteServer ? (await viteServer.ssrLoadModule("/node_modules/wildpig/router/index.ts"!)).routes as WildPigRouteObject[] : (await import("../router")).routes;
    const matches = matchRoutes(routes, url.pathname);
    if(!matches)return new Response("404 Not Found", { status: 404 });

    // 请求服务端数据
    const matchRoute = matches.at(-1)!;
    let serverDataApi = matchRoute.route.serverDataApi;
    let serverData = await (async () => {
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
    })();




    // 构造响应页面
    // 1. 读取 index.html
    const template = viteServer ? await viteServer.transformIndexHtml(request.url, fs.readFileSync('./index.html', 'utf-8')) : fs.readFileSync(path.resolve(__dirname, './client/index.html'), 'utf-8');
    // 2. 获取渲染函数
    const render = (await import('../entry/server')).render
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
}

/** 启动后的描述性文字 */
const afterStart = async (options: ICreateServerOptions) => {
// 启动后的文字
console.log(` __        __ _  _      _   ____   _        
 \\ \\      / /(_)| |  __| | |  _ \\ (_)  __ _ 
  \\ \\ /\\ / / | || | / _\` | | |_) || | / _\` |
   \\ V  V /  | || || (_| | |  __/ | || (_| |
    \\_/\\_/   |_||_| \\__,_| |_|    |_| \\__, |
                                      |___/ `)
console.log(chalk.blue.bgGreen(`         🐗 WildPig version ${packageInfo?.version} by ${packageInfo?.author}       `));
console.log(chalk.green("          Strong & Fast Fullstack Framework\n"));
console.log(chalk.green("✨ WildPig is running on port " + options.port || 3000));
console.log(chalk.yellow(`💻 Wildpig is Running in ${chalk.yellow.bold(env.NODE_ENV)} mode.`));
if(viteServer)console.log(chalk.green("⚡ Vite server is running on port " + viteServer.config.server?.port));
console.log(chalk.green(`🔗 Click to debug in Browser: http://localhost:${options.port}`));
}

export const createServer = async (options?: ICreateServerOptions) => {
    options = Object.assign({
        port: 3000,
        host: "0.0.0.0",
        showInfo: true,
    }, options || {});

    // 确保重启后可以重新拿到路由
    const apiModules = await getApiRouteModules(env.NODE_ENV === "development" ? "dev" : "prod") as any;
    const server = Bun.serve({
        port: options.port,
        hostname: options.host,
        routes:{
            ...apiModules,
            "/*": frontHandler(apiModules),
        },
        development: env.NODE_ENV === "development",
    })
    if(options.showInfo)await afterStart(options);
    return server;
}