import { useNavigate } from "react-router";
import { Button } from "antd";



export function Index(){
    const navigate = useNavigate();
    return <div>
        <Button type="primary" onClick={() => navigate("/home?a=1")}>
            前往Home
        </Button>
    </div>
}