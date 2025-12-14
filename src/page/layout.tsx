import { Outlet } from "react-router";



export const MainLayout = () => {
    return <div>
        <input type="text" placeholder="Search" />
        <button>Search</button>
        <div className="text-red-500">
            红红红
        </div>
        <Outlet />
    </div>
}