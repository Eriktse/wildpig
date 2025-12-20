import { WildPigRouteObject } from "#/router/types";
import { Index } from "@/page";
import { Home } from "@/page/home";
import { MainLayout } from "@/page/layout";

export default [
    {
        path: "/",
        Component: MainLayout,
        children: [
            {
                path: "/hello/:id",
                Component: Index,
                serverDataApi: "/api/server-data/hello/:id"
            }
        ]
    },
    {
        path: "/home",
        Component: Home,
        serverDataApi: "/api/server-data/home"
    }
] as WildPigRouteObject[];