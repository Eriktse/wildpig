import path from "node:path";
import { packageApiRoutes } from "./apiRoutes";
import { packageStatic } from "./packageStatic";

const prebuild = async () => {
    await packageStatic();
    await packageApiRoutes();
};


export const build = async () => {
    // 前处理
    await prebuild();
    // 正式编译
    await Bun.build({
        entrypoints: [path.resolve(__dirname, "./server.ts")],
        compile: true,
        outdir: "./dist",
        define: {
            "process.env.NODE_ENV": JSON.stringify("production"),
        },
    });
}