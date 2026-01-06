import { getApiRouteModules } from "./ApiRoutes";
import { type ViteDevServer} from "vite";
import { matchRoutes } from "react-router";
import fs from "node:fs";
import { WildPigRouteObject } from "./router/types";
import packageInfo from "../package.json";
import path from "node:path";
import chalk from "chalk";

const __dirname = import.meta.dirname;
import { handleAfterStartServer } from "./hooks/afterStartServer";
import { getWildpigConfig } from "./config";

const env = process.env;


export class WildpigServer {
    private viteServer: ViteDevServer | undefined;
    constructor(viteServer?: ViteDevServer | undefined){
        if(viteServer)this.viteServer = viteServer;
    }

    async frontHandler (apiModules: any){
        return async (request: Request) => {
            // 判断pathname是否匹配pageRoutes
            const url = new URL(request.url);

            // 判断是否是vite请求
            if(url.pathname.includes(".") || url.pathname.startsWith("/@") || url.pathname.startsWith("/assets")){
                if(this.viteServer){// 交给vite
                    const viteURL = new URL(request.url);
                    viteURL.port = this.viteServer.config.server.port.toString();
                    const response = await fetch(viteURL.toString(), {
                        method: request.method,
                        headers: request.headers,
                        body: request.body,
                    });
                    return response.clone();
                }else{// production环境，直接返回文件
                    const filepath = path.resolve(__dirname, "./client" + url.pathname);
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
            const routes = this.viteServer ? (await this.viteServer.ssrLoadModule("/node_modules/wildpig/src/router/index.ts"!)).default as WildPigRouteObject[] : (await import("./router/index")).default;
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
            const template = this.viteServer ? await this.viteServer.transformIndexHtml(request.url, fs.readFileSync('./index.html', 'utf-8')) : fs.readFileSync(path.resolve(__dirname, './client/index.html'), 'utf-8');
            // 2. 获取渲染函数
            const { render } = this.viteServer ? await this.viteServer.ssrLoadModule("/node_modules/wildpig/src/entry/server.tsx") : await import('./entry/server')
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
    }
    

    /** 启动后的描述性文字 */
    async afterStart () {
        const config = getWildpigConfig();
        // 启动后的文字
        console.log(chalk.blue.bgGreen(`         🐗 WildPig version ${packageInfo?.version} by ${packageInfo?.author}       `));
        console.log(chalk.green("          Strong & Fast Fullstack Framework\n"));
        console.log(chalk.green("✨ WildPig is running on port " + (config?.server?.port || 3000)));
        console.log(chalk.yellow(`💻 Wildpig is Running in ${chalk.yellow.bold(env.NODE_ENV)} mode.`));
        if(this.viteServer)console.log(chalk.green("⚡ Vite server is running on port " + this.viteServer.config.server?.port));
        console.log(chalk.green(`🔗 Click to debug in Browser: http://localhost:${config?.server?.port || 3000}`));
    }

    async createServer () {
        const config = getWildpigConfig();
        const apiModules = await getApiRouteModules(env.NODE_ENV === "development" ? "dev" : "prod");
        const server = Bun.serve({
            port: config?.server?.port || 3000,
            hostname: config?.server?.host || "0.0.0.0",
            routes:{
                ...apiModules,
                "/*": await this.frontHandler(apiModules),
            },
            development: env.NODE_ENV === "development",
        })
        await this.afterStart();
        // 服务器创建好了， 触发afterStartServer回调
        await handleAfterStartServer(server);
        return server;
    }
}