import { useEffect } from "react";
import { useRouter } from "expo-router";

export const useAuthRedirect = (isAuthenticated) => {
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated !== undefined) {
            router.push(isAuthenticated ? "/register" : "/login");
        }
    }, [isAuthenticated, router]);
};