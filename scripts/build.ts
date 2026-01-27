import path from "node:path";
import { build as viteBuild } from "vite";
import { packageApiRoutes } from "../src/ApiRoutes";
import { IBuildOptions } from "../src/types";
import chalk from "chalk";
import fs from "fs";
import { getWildpigConfig, IWildpigConfig, setWildpigConfig } from "@/config";

const __dirname = import.meta.dirname;
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
    
    // 打包api路由
    promises.push(packageApiRoutes());
    
    // 生成一个仅导入初始化代码的文件
    const config = getWildpigConfig();
    if(!config) throw new Error("获取wildpig.config.ts配置文件失败。");

    const initEntryPath = "../../../" + (config.initEntry || "src/index.ts");
    fs.writeFileSync(path.resolve(__dirname, "../build/import-init.ts"), `//临时文件，仅用于打包时静态导入\n import "${initEntryPath}"\nexport default undefined;`);

    await Promise.all(promises);
};


export const build = async () => {
    console.log(chalk.green("开始构建..."));

    // 加载配置文件
    let config: IWildpigConfig | undefined;
    try{
        config = (await import("../../../wildpig.config.ts"!)).default;
        if(config)setWildpigConfig(config);
    }catch(e){
        console.error("获取wildpig.config.ts配置文件失败，请检查！", e);
    }


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