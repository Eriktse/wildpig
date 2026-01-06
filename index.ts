
import { onAfterStartServer } from "./src/hooks/afterStartServer";
import { defineConfig } from "./src/config";
import { serverDataStore } from "./src/store/serverDataStore";
import { ServerDataGuard } from "./src/router/ServerDataGuard";
import type { WildPigRouteObject } from "./src/router/types";

export {
    // config
    defineConfig,

    // hook
    onAfterStartServer,


    // router
    serverDataStore,
    ServerDataGuard,
    WildPigRouteObject
};