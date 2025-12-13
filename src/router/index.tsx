import { Index } from "@/page";
import { Home } from "@/page/home/index";
import { MainLayout } from "@/page/layout";
import { createBrowserRouter } from "react-router";

export const browserRouter = createBrowserRouter([
    {
        path: "/",
        Component: MainLayout,
        children:[
            {
                path: "",
                Component: Index
            },
            {
                path: "home",
                Component: Home
            }
        ]
    },
]);