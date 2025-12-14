import { MainLayout } from "@/page/layout";
import { createBrowserRouter } from "react-router";

export const browserRouter = createBrowserRouter([
    {
        path: "/",
        Component: MainLayout,
    },
]);