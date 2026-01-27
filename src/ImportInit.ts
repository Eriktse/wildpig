import chalk from "chalk";
import { getWildpigConfig } from "./config";
import fs from "fs";
import path from "path";



export const makeImportInitFile = () => {
    // 生成一个仅导入初始化代码的文件
    const config = getWildpigConfig();
    if(!config) throw new Error("获取wildpig.config.ts配置文件失败。");

    const initEntry = config.initEntry || "src/index.ts";
    if(!fs.existsSync(initEntry)){
        console.warn("初始化文件 " + initEntry + " 不存在，请检查!");
        return;
    }
    const initEntryPath = "../../../" + initEntry;


    fs.writeFileSync(path.resolve(__dirname, "../build/import-init.ts"), `//临时文件，仅用于打包时静态导入\n import "${initEntryPath}"\nexport default undefined;`);
    console.log(chalk.green("初始化文件生成成功: " + path.resolve(__dirname, "../build/import-init.ts")));
}