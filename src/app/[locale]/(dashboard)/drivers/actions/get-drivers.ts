import axios from "axios";

export const getDrivers = async () => {
    // GET TOKEN FROM LOCAL STORAGE
    // const token = localStorage.getItem("token");
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiNjg3MjU4N2M2ZWM0NDM0ZTM2YzAxYjM4Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzNjIzMjAyLCJleHAiOjE3ODUxODA4MDJ9.taSHD5UyzIXRE__tZ0xke_PWkxRWb2EnnIOQJEg7f44";

    try {
        const response = await axios.get(`${process.env.API_URL}/all/drivers`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // You can add any additional parameters or configurations here if needed
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching drivers:", error);
        throw error;
    }
};
