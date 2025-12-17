import { serverDataStore } from "#/store/serverDataStore";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";



export function Index(){
    const serverData = useStore(serverDataStore);
    const navigate = useNavigate();
    useEffect(() => {
        console.log("index serverData", serverData);
    }, [serverData]);

    return <div>
        <div>
            <div>{serverData?.data?.message || "My App"}</div>
        </div>
        <button onClick={() => navigate("/home")} className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-blue-600 duration-300">go home</button>
    </div>
}