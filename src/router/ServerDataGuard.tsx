import { useEffect } from "react"
import { matchRoutes, Outlet, useLocation, useNavigate } from "react-router"
import { serverDataStore } from "../store/serverDataStore";
import { pageRoutes } from "./pageRoutes";

export const ServerDataGuard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        // serverData清空
        serverDataStore.set(undefined);

        const pathname = location.pathname;
        const matches = matchRoutes(pageRoutes, pathname);
        const lastMatch = matches?.at(-1);
        if(!lastMatch) {
            // 404
            navigate("/404");
            return;
        }
        // 成功匹配
        let serverDataApi = lastMatch.route.serverDataApi;
        if(!serverDataApi)return;

        // 替换参数
        for(const [key, value] of Object.entries(lastMatch.params)){
            if(value)serverDataApi = serverDataApi.replace(":" + key, value);
        }

        // 合并当前页面和serverDataApi的参数
        const searchParams = new URLSearchParams(location.search);
        for(const [key, value] of searchParams.entries()){
            // 跳过已有参数
            if(serverDataApi.includes(key + "="))continue;
            serverDataApi += (serverDataApi.includes("?") ? "&" : "?") + key + "=" + value;
        }

        fetch(serverDataApi).then(res => res.json()).then(data => {
            serverDataStore.set(data);
            if(data.title){
                document.title = data.title;
            }
        });
    }, [location]);

    return <Outlet />;
}