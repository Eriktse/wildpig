import { RouterProvider } from "#/router/react-router";
import { browserRouter } from "./router";
import { RouterMetaGuard } from "#/router/MetaGuard";


export const App = () => <RouterProvider router={RouterMetaGuard(browserRouter)} />;
