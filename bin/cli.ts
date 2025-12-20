#!/usr/bin/env bun
import chalk from "chalk";
import { build } from "../scripts/build";
import { spawn } from "bun";
import fs from "node:fs";
const command = process.argv[2];

if(command === "start"){
    // 判断系统平台
    const platform = process.platform;
    let serverBin = "./server"; // linux
    if(platform === "win32")serverBin = "server";
    // 设置一些环境变量
    process.env.NODE_ENV = "production";
    console.log(chalk.green("✨ [Wildpig] Start production server..."));
    const st = performance.now();
    // 启动二进制文件
    spawn([serverBin], {
        cwd: "./dist",
        stdout: "inherit",
        env: {
            ...process.env
        }
    });
    const ed = performance.now();
    setTimeout(() => {
        console.log(chalk.green("✨ [Wildpig] Production server started in " + Math.floor(ed - st) + "ms"));
    }, 300);
}


if(command === "dev"){
    // 设置一些环境变量
    process.env.NODE_ENV = "development";
    // 监测是否有node_modules/wildpig
    const wildpigExist = fs.existsSync("./node_modules/wildpig");
    const serverPath = wildpigExist ? "./node_modules/wildpig/scripts/server.ts" : "./scripts/server.ts";
    spawn(["bun", "run", "--hot", serverPath], {
        cwd: ".",
        stdout: "inherit",
        env: {
            ...process.env
        }
    });
}


if(command === "build"){
    // 设置一些环境变量
    process.env.NODE_ENV = "production";
    const st = performance.now();
    await build();
    console.log(chalk.green("🐗 [Wildpig] Build done, time:"), chalk.blue(performance.now() - st, "ms"));
    console.log(chalk.green(`✨ [Wildpig] Start by command:`), chalk.blue(`bun run start`));
}