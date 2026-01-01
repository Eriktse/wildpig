import { ServerDataGuard } from "./ServerDataGuard";
import { WildPigRouteObject } from "./types";

// 用户代码
let pageRoutes: WildPigRouteObject[] = (await import("../../../src/router/routes"!)).default;


export const routes = [
    {
        path: "/",
        Component: ServerDataGuard,
        children: pageRoutes,
    },
] as WildPigRouteObject[];