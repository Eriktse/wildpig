import { serverDataStore } from "@/serverData";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";



export function Index(){
    const serverData = useStore(serverDataStore);
    const navigate = useNavigate();
    useEffect(() => {
        console.log("serverData", serverData);
    }, [serverData]);

    return <div>
        <div>
            <div>{serverData?.data?.message || "My App"}</div>
        </div>

        <button onClick={() => navigate("/home")}>go home</button>
    </div>
}