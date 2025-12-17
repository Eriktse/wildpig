import { createBrowserRouter } from "react-router";
import pageRoutes from "@/router/routes";
import { ServerDataGuard } from "./ServerDataGuard";


/** 生成路由器，可用于监听路由变化 */
export const browserRouter = createBrowserRouter([
    {
        path: "/",
        Component: ServerDataGuard,
        children: pageRoutes,
    },
]);