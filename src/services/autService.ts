const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const loginRequest = async (operatorCode: string) => {
  try {
    const url = `${API_URL}operator/${operatorCode}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
