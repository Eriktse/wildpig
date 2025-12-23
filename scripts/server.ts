import chalk from "chalk";
import path from "node:path";
import { watch } from "node:fs";
import { startServer } from "./WildPig";
import viteConfig from "#/vite.config";
const env = process.env;


const port = env.PORT || 3000;
const hostname = env.HOSTNAME || "localhost";
const isDev = env.NODE_ENV === "development";

const getPackageInfo = async () => {
    const packageJson = await Bun.file(path.resolve(__dirname, "../package.json")).json();
    return packageJson;
}
const packageInfo = await getPackageInfo();

const startHotServer = async () => {
    let server = await startServer();
    if(isDev){
        watch("src", {recursive: true}, async (event, filename) => {
            // 只监测文件路径变化
            if(event !== "rename")return;

            console.log(chalk.green("检测到src下文件路径变化（新增、删除或移动文件），重启服务..."));
            await server.stop();
            setTimeout(async () => {
                server = await startServer();
                console.log(chalk.green("服务已重启"));
            }, 1000);
        })
    }
}
await startHotServer();


const afterStart = () => {
// 启动后的文字
console.log(` __        __ _  _      _   ____   _        
 \\ \\      / /(_)| |  __| | |  _ \\ (_)  __ _ 
  \\ \\ /\\ / / | || | / _\` | | |_) || | / _\` |
   \\ V  V /  | || || (_| | |  __/ | || (_| |
    \\_/\\_/   |_||_| \\__,_| |_|    |_| \\__, |
                                      |___/ `)
console.log(chalk.blue.bgGreen(`         🐗 WildPig version ${packageInfo?.version} by ${packageInfo?.author}       `));
console.log(chalk.green("          Strong & Fast Fullstack Framework\n"));
console.log(chalk.green("✨ WildPig is running on port " + env.PORT || 3000));
if(isDev){
    console.log(chalk.yellow("💻 Wildpig is Running in development mode."));
    console.log(chalk.green("⚡ Vite server is running on port " + viteConfig.server?.port));
}else{
    console.log(chalk.green("💻 Wildpig is Running in production mode."));
}
console.log(chalk.green(`🔗 Click to debug in Browser: http://${hostname}:${port}`));
}
afterStart();