import path from "node:path";
import { build as viteBuild } from "vite";
import { packageApiRoutes } from "../src/ApiRoutes";
import { IBuildOptions } from "../src/types";
import chalk from "chalk";

const __rootdir = path.resolve(__dirname, "../../../"); // 项目根目录

const prebuild = async (options?: IBuildOptions) => {
    const promises = [];
    // 先编译客户端代码
    promises.push(viteBuild({
        configFile: path.resolve(__rootdir, "vite.config.ts"),
        build: {
            outDir: path.resolve(__rootdir, options?.outdir || "dist", "client"), // 输出目录
        },
    }));
    promises.push(packageApiRoutes());
    await Promise.all(promises);
};


export const build = async () => {
    console.log(chalk.green("开始构建..."));

    // 准备阶段
    process.env.NODE_ENV = "production";
    const st = performance.now();

    // 前处理
    await prebuild();
    // 正式编译
    await Bun.build({
        entrypoints: [path.resolve(__dirname, "../scripts/prod.ts")],
        minify: false, // 压缩
        target: "bun",
        outdir: "./dist",
        format: "esm",
        external: ["*.css"],
    });


    console.log(chalk.green("🐗 [Wildpig] Build done, time:"), chalk.blue(performance.now() - st, "ms"));
    console.log(chalk.green(`✨ [Wildpig] Start by command:`), chalk.blue(`bun run start`));
}

build();