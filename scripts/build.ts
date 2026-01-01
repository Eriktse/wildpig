import path from "node:path";
import { packageApiRoutes } from "./apiRoutes";
import { build as viteBuild } from "vite";
import { IBuildOptions } from "./types";
import chalk from "chalk";

const __rootdir = path.resolve(__dirname, "../../../"); // 项目根目录

const prebuild = async (options: IBuildOptions) => {
    const promises = [];
    // 先编译客户端代码
    promises.push(viteBuild({
        configFile: path.resolve(__rootdir, "vite.config.ts"),
        build: {
            outDir: path.resolve(__rootdir, options.outdir || "dist", "client"), // 输出目录
        },
    }));
    // promises.push(viteBuild({
    //     configFile: path.resolve(__rootdir, "vite.config.ts"),
    //     build: {
    //         rollupOptions:{
    //             input: path.resolve(__dirname, "../entry/server.tsx"),
    //         },
    //         outDir: path.resolve(__rootdir, options.outdir || "dist", "server"), // 输出目录
    //         ssr: true, // 开启ssr
    //     },
    // }));
    promises.push(packageApiRoutes());
    await Promise.all(promises);
};


export const build = async (options?: IBuildOptions) => {
    options = Object.assign({
        entry: "server.ts",
        outdir: "dist",
        minify: true,
        target: "bun",
        external: [],
    }, options || {});


    console.log(chalk.green("开始构建..."));
    console.log("构建参数：", options);

    // 准备阶段
    process.env.NODE_ENV = "production";
    const st = performance.now();


    // 前处理
    await prebuild(options);
    // 正式编译
    await Bun.build({
        entrypoints: [path.resolve(__rootdir, options.entry || "server.ts")],
        minify: options.minify || true, // 压缩
        target: options.target || "bun",
        outdir: options.outdir || "./dist",
        format: "esm",
        external: ["vite", ...(options.external || [])],
        define: {
            "process.env.NODE_ENV": JSON.stringify("production"),
        },
    });


    console.log(chalk.green("🐗 [Wildpig] Build done, time:"), chalk.blue(performance.now() - st, "ms"));
    console.log(chalk.green(`✨ [Wildpig] Start by command:`), chalk.blue(`bun run start`));
    return;
}