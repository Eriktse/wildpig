import chalk from "chalk";
import { htmlString } from "./htmlString";
import { routes, metaRoutes } from "./prepareRoutes";
import { readFileSync } from "node:fs";
import devIndexHtml from "#/public/devIndex.html"

const env = process.env;
const isDev = env.NODE_ENV === "development";


export const startServer = () => {
    Bun.serve({
        port: env.PORT || 3000,
        hostname: env.HOST || "0.0.0.0",
        routes:{
            ...routes,
            ...metaRoutes,
            "/favicon.ico": () => new Response(Bun.file("./public/favicon.ico"), {
                headers: {
                    "content-type": "image/x-icon",
                }
            }),
            "/render.js": () => new Response((readFileSync("./public/render.js.br")), {
                headers: {
                    "Content-Encoding": "br",
                    "Content-Type": "text/javascript; charset=utf-8",
                    "Cache-Control": isDev ? "no-cache" : "public, max-age=31536000, immutable"
                }
            }),
            "/*": isDev ? devIndexHtml : async (request) => {
                const url = "/" + (request.url.split("/")[3] || "");
                // console.log("url:", url);
                const pathname = "/_WILDPIG_META_API" + url.split("?")[0];
                let meta: {title: string} | null = null;

                if(pathname in metaRoutes){
                    const metaRes = await metaRoutes[pathname]();
                    meta = await metaRes.json();
                }
                return new Response(htmlString.replace("{{TITLE}}", meta?.title || "WildPig"), {
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
    console.log(chalk.blue.bgGreen("         🐗 WildPig version 1.0.11 by eriktse       "));
    console.log(chalk.green("          Strong & Fast Fullstack Framework\n"));
    console.log(chalk.green("✨ WildPig is running on port " + env.PORT || 3000));
    if(isDev){
        console.log(chalk.yellow("💻 Wildpig is Running in development mode."));
    }else{
        console.log(chalk.green("💻 Wildpig is Running in production mode."));
    }
    console.log(chalk.green("🔗 Click to debug in Browser: http://localhost" + ":" + (env.PORT || 3000)));
}