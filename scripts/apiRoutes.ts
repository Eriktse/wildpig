import { readdirSync, statSync, writeFileSync } from "fs";

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

export const makeApiRoutePathObj = () => {
    // 扫描路径
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
    let importsText = "";
    let routesText = "export default {\n";
    for(const route of Object.keys(apiRoutes)) {
        const importPath = apiRoutes[route];

        // 尝试从文件中获取路由
        identId ++;
        const moduleName = `r${identId}`;
        importsText += `import ${moduleName} from "${importPath.replace(".ts", "")}";\n`;
        routesText += `\t"${route}": ${moduleName},\n`
    }
    routesText += "}";
    writeFileSync("./build/built-api-routes.ts", importsText + routesText);
};

/**
 * 获取api路由，dev模式，直接导入
 */
export const getApiRouteModules = async (mode: "dev" | "prod") => {
    if(mode === "dev"){
        const apiRoutes = makeApiRoutePathObj();
        const result: Record<string, any> = {};
        for(const route of Object.keys(apiRoutes)) {
            const importPath = apiRoutes[route];
            const module = await import(importPath.replace(".ts", ""));
            result[route] = module.default;
        }
        return result;
    } else {
        const module = await import("#/build/built-api-routes");
        return module.default;
    }
}