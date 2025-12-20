import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { serverDataStore } from '../store/serverDataStore';
import { browserRouter } from '../router/index.js';
import "./tailwindcss4.js"

const isDev = process.env.NODE_ENV === 'development';


// 确保在 DOM 加载完成后才进行水合
document?.addEventListener("DOMContentLoaded", () => {
    // 获取根元素
    const rootElement = document.getElementById('root')!;

    // 从 window 对象获取服务端数据
    const serverData = (window as any).__SERVER_DATA__;

    // 设置服务端数据到 store
    serverDataStore.set(serverData);
    
    if(isDev){
        // 开发时，使用 createRoot 进行渲染
        const root = createRoot(rootElement);
        root.render(<RouterProvider router={browserRouter} />);
    }else{
        // 生产环境，使用 hydrateRoot 进行水合
        hydrateRoot(rootElement, (<RouterProvider router={browserRouter} />));
    }
});