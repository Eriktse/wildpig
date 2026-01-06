import { createServer as createViteServer } from "vite";
import path from "node:path";
import { WildpigServer } from "../src/WildpigServer";
import chalk from "chalk";
import { IWildpigConfig, setWildpigConfig } from "../src/config";


const __dirname = import.meta.dirname;
const __rootdir = path.resolve(__dirname, "../../../");



// 启动vite server
const viteServer = await createViteServer({
    configFile: path.resolve(__rootdir, "./vite.config.ts"),
});
await viteServer.listen(viteServer.config.server.port);



// 加载配置文件
let config: IWildpigConfig | undefined;
try{
    config = (await import("../../../wildpig.config.ts"!)).default;
    if(config)setWildpigConfig(config);
}catch(e){
    console.error("获取wildpig.config.ts配置文件失败，请检查！", e);
}

// 运行初始化代码
const initEntry = config?.initEntry || "src/index.ts";
try{
    await import(("../../../" + initEntry)!);
    console.log(chalk.green("初始化代码执行成功：", initEntry));
}catch(e){
    console.warn("未执行初始化代码，请检查文件是否存在：" + initEntry)
}

const wildpigServer = new WildpigServer(viteServer);
await wildpigServer.createServer();
