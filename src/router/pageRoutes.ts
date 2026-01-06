import { WildPigRouteObject } from "./types";

// 用户代码（会在index.js中被引入）
export const pageRoutes: WildPigRouteObject[] = (await import("../../../../src/router/routes"!)).default;