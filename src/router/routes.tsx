import { Index } from "@/page";
import { Home } from "@/page/home";
import { MainLayout } from "@/page/layout";
import { RouteObject } from "react-router";

type WildPigRouteObject = RouteObject & {
    // 是否需要登录
    serverDataApi?: string;
    children?: WildPigRouteObject[];
}

export default [
    {
        path: "/",
        Component: MainLayout,
        children: [
            {
                index: true,
                Component: Index,
                serverDataApi: "/api/server-data/hello"
            }
        ]
    },
    {
        path: "/home",
        Component: Home
    }
] as WildPigRouteObject[];