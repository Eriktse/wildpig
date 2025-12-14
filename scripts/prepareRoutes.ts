import { readFileSync, writeFileSync } from "node:fs";
import { scanMetaRoutes, scanRoutes } from "./genRoutes";
import { gzipSync } from "bun";

const isDev = process.env.NODE_ENV === "development";

// 准备服务端路由表
let routes = {};
let metaRoutes: Record<string, (req: Request) => Promise<Response>> = {};
if(isDev){
    // 引入，用于监听
    setTimeout(() => import("@/App").catch(() => {}), 1000);
    routes = scanRoutes().routes;
    metaRoutes = scanMetaRoutes().routes;
    /** 编译js */
    await Bun.build({
        entrypoints: ["./public/render.tsx"],
        outdir: "./public",
        format: "esm",
        minify: true,
    });

}else{
    routes = require("#/build/built-routes.ts").default;
    metaRoutes = require("#/build/built-meta-routes.ts").default;
}

export { routes, metaRoutes };