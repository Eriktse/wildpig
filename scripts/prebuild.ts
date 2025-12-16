import { packageApiRoutes } from "./apiRoutes";
import { packageStatic } from "./packageStatic";

export const prebuild = async () => {
    await packageStatic();
    await packageApiRoutes();
}