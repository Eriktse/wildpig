import ReactDOM from 'react-dom/client';
import { App } from '@/App';



document.addEventListener("DOMContentLoaded", () => {
    // 获取根元素
    const rootElement = document.getElementById('root')!;

    // 创建根并渲染组件
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
});