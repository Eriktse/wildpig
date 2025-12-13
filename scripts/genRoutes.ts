// scripts/scan-routes.js
import { middleware } from '@/middleware';
import { statSync, readdirSync, writeFileSync } from 'fs';

/** 获取文件的相对路径 */
const getFilePaths = (dir: string) => {
    const res: string[] = [];
    const files = readdirSync(dir);
    files.forEach(file => {
        const filePath = `${dir}/${file}`;
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
            res.push(...getFilePaths(filePath));
        } else {
            res.push(filePath);
        }
    });
    return res;
}

export const scanRoutes = () => {
    // 扫描src文件夹
    const files = getFilePaths("./src/api");
    const routes: {[key: string]: {
        GET?: (req: any) => any;
        POST?: (req: any) => any;
        PUT?: (req: any) => any;
        DELETE?: (req: any) => any;
    }} = {};


    const routeScripts: {[key: string]: string} = {}; // 存储路由对应的脚本文件路径
    for(const file of files) {
        const filepath = file.replace("./", "#/");
        if(!filepath.includes("index.ts")) continue;

        // 尝试从文件中获取GET函数
        const handler = require(filepath);
        if(handler) {
            const route = filepath.replace("#/src/api", "/api").replace("/index.ts", "");
            routes[route] = {
                GET: (req: any) => middleware(req, handler.GET),
                POST: (req: any) => middleware(req, handler.POST),
                PUT: (req: any) => middleware(req, handler.PUT),
                DELETE: (req: any) => middleware(req, handler.DELETE),
            };
            routeScripts[route] = filepath;
        }
    }
    return {routes, routeScripts};
}

export const genRoutes = async () => {
    const {routeScripts} = scanRoutes();
    let text = "import { middleware } from \"@/middleware\";\n\nexport default {\n";
    for(const route in routeScripts) {
        text += `"${route}": {`;
        text += `GET: (req: any) => middleware(req, require("${routeScripts[route]}").GET), \n`;
        text += `POST: (req: any) => middleware(req, require("${routeScripts[route]}").POST), \n`;
        text += `PUT: (req: any) => middleware(req, require("${routeScripts[route]}").PUT), \n`;
        text += `DELETE: (req: any) => middleware(req, require("${routeScripts[route]}").DELETE), \n`;
        text += `}\n`;
    }
    text += "}";
    writeFileSync("./build/built-routes.ts", text);
}



export const scanMetaRoutes = () => {
    // 扫描src文件夹
    const files = getFilePaths("./src/page");
    const routes: {[key: string]: () => Promise<Response>} = {};
    const routeScripts: {[key: string]: string} = {}; // 存储路由对应的脚本文件路径
    for(const file of files) {
        const filepath = file.replace("./", "#/");
        if(!filepath.includes("meta.ts")) continue;
        
        // 尝试从文件中获取GET函数
        const { getMeta } = require(filepath);
        if( getMeta ) {
            let route = filepath.replace("#/src/page", "").replace("/meta.ts", "");
            route = "/_WILDPIG_META_API" + (route || "/");
            routes[route] = getMeta;
            routeScripts[route] = filepath;
        }
    }
    return {routes, routeScripts};
}

export const genMetaRoutes = async () => {
    const {routeScripts} = scanMetaRoutes();
    let text = "export default {\n";
    for(const route in routeScripts) {
        text += `    "${route}": require("${routeScripts[route]}").getMeta, \n`;
    }
    text += "}";
    writeFileSync("./build/built-meta-routes.ts", text);
}