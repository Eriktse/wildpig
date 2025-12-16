import { getBrowserEnvironment } from "../utils/client/environment";
import { createBrowserRouter } from "react-router";
// 为了获取type而创建的router
const browserRouterForType = createBrowserRouter([
    {
        path: "/just-for-type",
        Component: null,
    }
]);
export type BrowserRouter = typeof browserRouterForType;


// /**
//  * 获取meta信息
//  * @param url like "/home?a=1"
//  */
// const refreshMeta = (url: string) =>{
//     console.log("get url:", url);
//     fetch("/_WILDPIG_META_API" + url).then(res => res.json()).then(({title}) => {
//         document.title = title;
//     });
// }

// export const RouterMetaGuard = (browserRouter: BrowserRouter): BrowserRouter => {
    
//     // 检查meta，判断是否是dev环境
//     const isDev = getBrowserEnvironment() === "development";
//     if(isDev){
//         // 开发环境首次执行，生产阶段为了seo，无需首次执行
//         refreshMeta(window.location.pathname + window.location.search);
//     }
    
//     // 每次跳转都会触发，包括 <Link>/navigate/前进后退
//     browserRouter.subscribe(({ location }) => {
//         refreshMeta(location.pathname + location.search);
//     });
//     return browserRouter;
// }