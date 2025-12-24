import path from "node:path";
import { packageApiRoutes } from "./apiRoutes";
import { build as viteBuild } from "vite";

const prebuild = async () => {
    const promises = [];
    // 先编译客户端代码
    promises.push(viteBuild({
        configFile: path.resolve(__dirname, "../../../vite.config.ts"),
        build: {
            outDir: "./dist/client",
        },
    }));
    // 编译服务端入口文件
    promises.push(viteBuild({
        configFile: path.resolve(__dirname, "../../../vite.config.ts"),
        
        build: {
            rollupOptions:{
                input: path.resolve(__dirname, "../entry/server.tsx"),
            },
            outDir: "./dist/server",
            ssr: true,
        },
    }));
    promises.push(packageApiRoutes());
    await Promise.all(promises);
};


export const build = async () => {
    // 前处理
    await prebuild();
    // 正式编译
    Bun.build({
        entrypoints: [path.resolve(__dirname, "./prodServer.ts")],
        compile: true,
        outdir: "./dist",
        define: {
            "process.env.NODE_ENV": JSON.stringify("production"),
        },
    });
}