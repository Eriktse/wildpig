import chalk from "chalk";
import path from "node:path";
import { watch } from "node:fs";
import { startServer } from "./devServer";
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


