import { RouterProvider } from "react-router";
import { browserRouter } from "./router";
import { RouterGuard } from "./router/guard";
RouterGuard();



export const App = () => <RouterProvider router={browserRouter} />;
