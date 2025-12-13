import { genMetaRoutes, genRoutes } from "./genRoutes";
import { packageStatic } from "./packageStatic";

await packageStatic();
await genRoutes();
await genMetaRoutes();