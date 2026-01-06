import { pageRoutes } from "./pageRoutes";
import { ServerDataGuard } from "./ServerDataGuard";
import { WildPigRouteObject } from "./types";

export default [
    {
        path: "/",
        Component: ServerDataGuard,
        children: pageRoutes,
    },
] as WildPigRouteObject[];