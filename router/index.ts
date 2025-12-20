import { createBrowserRouter } from "react-router";
import { ServerDataGuard } from "./ServerDataGuard";

// 用户代码
import pageRoutes from "@/router/routes";


/** 生成路由器，可用于监听路由变化 */
export const browserRouter = createBrowserRouter([
    {
        path: "/",
        Component: ServerDataGuard,
        children: pageRoutes,
    },
]);