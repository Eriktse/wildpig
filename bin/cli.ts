import chalk from "chalk";
import { build } from "../scripts/build";
import { spawn } from "bun";
const command = process.argv[2];

if(command === "start"){
    // 设置一些环境变量
    process.env.NODE_ENV = "production";
    console.log(chalk.green("✨ [Wildpig] Start production server..."));
    const st = performance.now();
    // 启动二进制文件
    spawn(["server"], {
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
    await import("../scripts/server");
}


if(command === "build"){
    // 设置一些环境变量
    process.env.NODE_ENV = "production";
    const st = performance.now();
    await build();
    console.log(chalk.green("🐗 [Wildpig] Build done, time:"), chalk.blue(performance.now() - st, "ms"));
    console.log(chalk.green(`✨ [Wildpig] Start by command:`), chalk.blue(`bun run start`));
}