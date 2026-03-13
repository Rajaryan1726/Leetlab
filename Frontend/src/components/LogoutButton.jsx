import React from "react";
import { useAuthStore } from "../store/useAuthStore";


const LogoutButton = ({ children, className }) => {
    const { logout } = useAuthStore()

    const onLogout = async () => {
        await logout();
    }

    return (
        <button className={className} onClick={onLogout}>
            {children}
        </button>
    )
}

export default LogoutButton;