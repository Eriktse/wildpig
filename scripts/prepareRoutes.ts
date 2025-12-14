import { readFileSync, writeFileSync } from "node:fs";
import { scanMetaRoutes, scanRoutes } from "./genRoutes";
import { brotliCompressSync } from "node:zlib";

const isDev = process.env.NODE_ENV === "development";

// 准备服务端路由表
let routes = {};
let metaRoutes: Record<string, () => Promise<Response>> = {};
if(isDev){
    // 引入，用于监听
    setTimeout(() => import("@/App").catch(() => {}), 1000);
    routes = scanRoutes().routes;
    metaRoutes = scanMetaRoutes().routes;
    /** 编译js */
    await Bun.build({
        entrypoints: ["./public/render.tsx"],
        outdir: "./public",
        format: "esm"
    });
    // 将 ./public/render.js 转为 ./public/render.br
    writeFileSync("./public/render.js.br", brotliCompressSync(Buffer.from(readFileSync("./public/render.js"))));

}else{
    routes = require("#/build/built-routes.ts").default;
    metaRoutes = require("#/build/built-meta-routes.ts").default;
}

export { routes, metaRoutes };