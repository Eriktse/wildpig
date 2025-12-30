import { browserRouter } from "../router";
import { App } from "@/App"
import { hydrateRoot } from "react-dom/client"



const render = () => {
    // 获取serverData
    const serverData = (window as any).__SERVER_DATA__ || undefined;
    // 水合
    hydrateRoot(document.getElementById('root')!, <App router={browserRouter} serverData={serverData} />)
}

document.addEventListener('DOMContentLoaded', render);