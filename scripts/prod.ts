import { WildpigServer } from "../src/WildpigServer";
import { IWildpigConfig, setWildpigConfig } from "../src/config";

// 加载配置文件
let config: IWildpigConfig | undefined;
try{
    config = (await import("../../../wildpig.config.ts"!)).default;
    if(config)setWildpigConfig(config);
}catch(e){
    console.error("获取wildpig.config.ts配置文件失败，请检查！");
}


// 运行初始化代码
try{
    await import("../build/import-init");
}catch(e){
    console.warn("未执行初始化代码，请检查文件是否存在。");
}



const wildpigServer = new WildpigServer();
await wildpigServer.createServer();