import { readdirSync, statSync, writeFileSync } from "fs";
import path from "node:path";
const __dirname = import.meta.dirname;


import { middleware } from "@/api/middleware";

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


const makeDynamicRoute = (route: string) => route.replaceAll(/\[([^\]]*)\]/g, ':$1');

export const makeApiRoutePathObj = () => {
    // 扫描用户代码路径
    const apiDir = "./src/api";
    const apiPaths = getFilePaths(apiDir);
    const result: Record<string, string> = {};

    for(const apiPath of apiPaths) {
        const importPath = apiPath.replace("./src/api", "#/src/api");
        if(!apiPath.includes("index.ts")) continue;
        const route = apiPath.replace("./src/api", "/api").replace("/index.ts", "");
        result[route] = importPath.replace(".ts", "");
    }
    return result;
}

/**
 * 生成api路由的配置文件
 */
export const packageApiRoutes = async () => {
    const apiRoutes = makeApiRoutePathObj();
    let identId = 0;
    let importsText = `import { middleware } from "@/api/middleware" \n`;
    let routesText = "export default {\n";
    for(const route of Object.keys(apiRoutes)) {
        const importPath = apiRoutes[route];
        // 尝试从文件中获取路由
        const module = await import(importPath);
        // 没有接口，就跳过
        if(!module.GET && !module.POST) continue;
        // 标识id
        identId ++;
        importsText += `import {\n`;
        routesText += `\t"${makeDynamicRoute(route)}": {\n`;
        if(module.GET) {
            importsText += `\tGET as GET${identId},\n`;
            routesText += `\t\tGET: (req: any) => middleware(req, GET${identId}),\n`;
        }
        if(module.POST) {
            importsText += `\tPOST as POST${identId},\n`;
            routesText += `\t\tPOST: (req: any) => middleware(req, POST${identId}),\n`;
        }
        importsText += `} from "${importPath}";\n`;
        routesText += `\t},\n`;
    }
    routesText += "}";
    writeFileSync(path.resolve(__dirname, "../build/built-api-routes.ts"), importsText + "\n" + routesText);
};

/**
 * 获取api路由，dev模式，直接导入
 */
export const getApiRouteModules = async (mode: "dev" | "prod") => {
    if(mode === "dev"){
        const apiRoutes = makeApiRoutePathObj();
        const result: Record<string, {
            GET?: (req: any) => Promise<Response>,
            POST?: (req: any) => Promise<Response>
        } > = {};
        for(const route of Object.keys(apiRoutes)) {
            const importPath = apiRoutes[route];
            const module = await import(importPath.replace(".ts", ""));
            if(!module.GET && !module.POST) continue;

            // 新建一个路由
            const dynamicRoute = makeDynamicRoute(route);
            result[dynamicRoute] = {};
            if(module.GET) result[dynamicRoute].GET = (req: any) => middleware(req, module.GET);
            if(module.POST) result[dynamicRoute].POST = (req: any) => middleware(req, module.POST);
        }
        return result;
    } else {
        // prod模式，直接从文件中导入
        const module = await import("../build/built-api-routes"!);
        return module.default;
    }
}