import { browserRouter } from "../router";
import { App } from "@/App"
import { hydrateRoot } from "react-dom/client"



const render = () => {
    // 水合
    hydrateRoot(document.getElementById('root')!, <App router={browserRouter} />)
}

document.addEventListener('DOMContentLoaded', render);