import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "customer_token";

export async function getToken() {
    try {
        return (await SecureStore.getItemAsync(TOKEN_KEY)) || "";
    } catch {
        return "";
    }
}

export async function setToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}
