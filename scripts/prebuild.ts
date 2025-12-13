import { genMetaRoutes, genRoutes } from "./genRoutes";
import { packageStatic } from "./packageStatic";

export const prebuild = async () => {
    await packageStatic();
    await genRoutes();
    await genMetaRoutes();
}