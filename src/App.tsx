import { RouterProvider } from "react-router";
import { browserRouter } from "./router";
import { RouterMetaGuard } from "#/router/MetaGuard";


export const App = () => <RouterProvider router={RouterMetaGuard(browserRouter)} />;
