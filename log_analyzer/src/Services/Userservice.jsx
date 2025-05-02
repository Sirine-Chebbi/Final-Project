import api from './api';
import { authService } from './authService';

export async function verifyPermissions() {
    try {
        const response = await api.get('auth/verify-permissions/');
        return response.data;
    } catch (error) {
        console.error("Permission verification failed:", error);
        throw error;
    }
}

export async function GetUser(mat) {
    let permissions;
try {
    permissions = await verifyPermissions();
    if (!permissions.can_view_users && mat !== permissions.matricule) {
        throw new Error("You can only view your own profile");
    }

    const response = await api.get(`auth/users/${mat}/`);
    return response.data;

} catch (error) {
    console.error("Error getting user:", error);

    if (error.response?.status === 403 && permissions?.can_view_users) {
        try {
            await authService.refreshToken();
            const retryResponse = await api.get(`auth/users/${mat}/`);
            return retryResponse.data;
        } catch {
            throw new Error("Session expired. Please login again.");
        }
    }

    throw error;
}

}

export async function DeleteUsers(mat) {
    try {
        // Verify permissions first
        const permissions = await verifyPermissions();
        if (!permissions.can_edit_users) {
            throw new Error("You don't have permission to delete users");
        }

        const response = await api.delete(`auth/users/${mat}/`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        
        if (error.response?.status === 403) {
            throw new Error("You don't have permission to delete users");
        }
        
        throw error;
    }
}