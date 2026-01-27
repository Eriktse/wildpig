import { Server } from "bun";
import { wildpigGlobalMap } from "../utils/server/globalMap";
// 初始化或获取全局回调数组
const getCallbacks = () => {
    if (!wildpigGlobalMap.getItem("__wildpigAfterStartServerCallbacks")) {
        wildpigGlobalMap.setItem("__wildpigAfterStartServerCallbacks", []);
    }
    return wildpigGlobalMap.getItem("__wildpigAfterStartServerCallbacks") as ((server: Server<undefined>) => void)[];
};

export const onAfterStartServer = async (cb: (server: Server<any>) => void) => {
    getCallbacks().push(cb);
}

export const handleAfterStartServer = async (server: Server<any>) => {
    for (const cb of getCallbacks()) { 
        cb(server);
    }
}
