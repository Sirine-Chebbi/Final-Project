export async function DeleteUsers(mat) {

        const token = localStorage.getItem("access_token");
        if (!token) { 
            return;
        }

        const response = await fetch(`http://127.0.0.1:8000/api/auth/users/${mat}/`, {
            method: "Delete",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return response

};

export async function GetUser(mat) {

    const token = localStorage.getItem("access_token");
    if (!token) { 
        return;
    }

    const response = await fetch(`http://127.0.0.1:8000/api/auth/users/${mat}/`, {
        method: "Get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    return response;

};
