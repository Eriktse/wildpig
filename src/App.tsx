import { RouterProvider } from "react-router";
import { useStore } from "@nanostores/react";
import { serverDataStore } from "../store/serverDataStore";


export const App = ({router, serverData}: {router: any, serverData?: any}) => {
    serverDataStore.set(serverData);
    const serverDataState = useStore(serverDataStore);
    
    return (<html lang="en">
    <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{serverDataState?.title || "serverData 缺少 title属性"}</title>
        <style>
            {`
            body {
                margin: 0;
            }`}
        </style>
        <script dangerouslySetInnerHTML={{__html: `window.__SERVER_DATA__ = ${JSON.stringify(serverData)}`}}></script>
    </head>
    <body>
        <div id="root">
            <RouterProvider router={router} />
        </div>
        <script src="/render.js"></script>
    </body>
    </html>)
}
