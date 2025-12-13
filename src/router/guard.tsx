import { browserRouter } from ".";

export const RouterGuard = () => {
    // 每次跳转都会触发，包括 <Link>/navigate/前进后退
    browserRouter.subscribe(({ location }) => {
        // navigationType 值：'PUSH' | 'POP' | 'REPLACE'
        const url = location.pathname + location.search;
        // apiGetMeta(location.pathname);
        // 请求对应的meta api，修改title
        fetch("/_WILDPIG_META_API" + url).then(res => res.json()).then(({title}) => {
            document.title = title;
        })
    });
}