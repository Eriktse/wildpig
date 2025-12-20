import { useEffect, useState } from "react"
import { useNavigate } from "react-router";



export const NotFound = () => {
    const navigate = useNavigate();


    const [waitTime, setWaitTime] = useState(5);
    useEffect(() => {
        if(waitTime === 0){
            navigate("/");
        }else{
            setTimeout(() => setWaitTime(waitTime - 1), 1000);
        }
    }, [waitTime]);
    return <div>
        404 Not Found, go back to Home in {waitTime} seconds.
    </div>
}