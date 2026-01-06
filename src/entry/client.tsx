import { createBrowserRouter } from "react-router";
import routes from "../router";
import { hydrateRoot } from "react-dom/client"
// 这个文件由Vite加载
const { App } = await import('../../../../src/App'!);

const render = () => {
    // 获取serverData
    const serverData = (window as any).__SERVER_DATA__ || undefined;
    // 水合
    hydrateRoot(document.getElementById('root')!, <App router={createBrowserRouter(routes)} serverData={serverData} />)
}

render();