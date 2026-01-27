import { ConfigEnv, createServer as createViteServer, loadConfigFromFile, resolveConfig } from "vite";
import path from "node:path";
import { WildpigServer } from "../src/WildpigServer";
import chalk from "chalk";
import { IWildpigConfig, setWildpigConfig } from "../src/config";
import { wildpigGlobalMap } from "../src/utils/server/globalMap";


const __dirname = import.meta.dirname;
const __rootdir = path.resolve(__dirname, "../../../");

// 加载配置文件
let config: IWildpigConfig | undefined;
try{
    config = (await import("../../../wildpig.config.ts"!)).default;
    if(config)setWildpigConfig(config);
}catch(e){
    console.error("获取wildpig.config.ts配置文件失败，请检查！", e);
}



// 启动vite server
const viteConfig = await loadConfigFromFile(
    {
        mode: "development",
        command: "serve",
    },
    path.resolve(__rootdir, "./vite.config.ts")
);
if(!viteConfig)throw new Error("获取vite配置文件失败，请检查vite.config.ts文件是否存在！");

// 补充默认配置
const serverPort = config?.server?.port || 3000;
const userServerConfig = Object.assign({
    host: "0.0.0.0",
    port: 5173,
    hmr: {
        port: 5173,
        // 客户端会向这个端口+路径发送websocket请求，用于hmr
        clientPort: serverPort,
        path: "/__wildpig_hmr",
    },
}, viteConfig.config.server || {});

const viteServer = await createViteServer({
    configFile: path.resolve(__rootdir, "./vite.config.ts"),
    server: userServerConfig,
    mode: "development",
    command: "serve",
});
await viteServer.listen(userServerConfig.port);


// 运行初始化代码
const initEntry = config?.initEntry || "src/index.ts";
// 根据全局注册器判断是否已经运行过了
const isInitialized = wildpigGlobalMap.getItem("__wildpigInitialized");
if(!isInitialized){
    try{
        await import(("../../../" + initEntry)!);
        console.log(chalk.green("初始化代码执行成功：", initEntry));
        wildpigGlobalMap.setItem("__wildpigInitialized", true);
    }catch(e){
        console.warn("未执行初始化代码，请检查文件是否存在（或存在其他异常）：" + initEntry, e)
    }
}

const wildpigServer = new WildpigServer(viteServer);
await wildpigServer.createServer();
