import { RouteObject } from "react-router";

export type WildPigRouteObject = RouteObject & {
    // 是否需要登录
    serverDataApi?: string;
    children?: WildPigRouteObject[];
}