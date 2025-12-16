import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import "./tailwindcss4.js";
import pageRoutes from '@/router/routes.js';
import { serverDataStore } from '@/serverData.js';


// 确保在 DOM 加载完成后才进行水合
document.addEventListener("DOMContentLoaded", () => {
    // 获取根元素
    const rootElement = document.getElementById('root')!;

    // 从 window 对象获取服务端数据
    const serverData = (window as any).__SERVER_DATA__;
    
    // 设置服务端数据到 store
    serverDataStore.set(serverData);
    
    // 创建路由器
    const browserRouter = createBrowserRouter(pageRoutes);
    
    // 使用 setTimeout 确保数据已正确设置后再进行水合
    hydrateRoot(rootElement, <RouterProvider router={browserRouter} />);
});