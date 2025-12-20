import { NotFound } from "@/page/404";
import { Welcome } from "@/page/welcome";
import { WildPigRouteObject } from "../../router/types";


export default [
    {
        path: "/",
        Component: Welcome,
        serverDataApi: "/api/server-data/welcome?title=hello"
    }
] as WildPigRouteObject[];