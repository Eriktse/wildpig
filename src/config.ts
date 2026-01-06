import { wildpigGlobalMap } from "./utils/server/globalMap";

export interface IWildpigConfig {
    server?: {
        host?: string,
        port?: number | string,
    },
    /**
     * 入口文件，默认为src/index.ts，用户可以在这里编写一些自定义的初始化代码
     */
    initEntry?: string,
}



export const defineConfig = (config: IWildpigConfig) => config;

export const getWildpigConfig = () => wildpigGlobalMap.getItem("__wildpigConfig") as IWildpigConfig | undefined;

export const setWildpigConfig = (_config: IWildpigConfig) => {
    wildpigGlobalMap.setItem("__wildpigConfig", _config);
}