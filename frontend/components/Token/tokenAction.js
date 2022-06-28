const USER_TOKEN_KEY = 'access_token';
const USER_REFRESH_KEY = 'access_token_refresh';

//JS FIle for handling local storage
export function getUserToken() {
    return localStorage.getItem(USER_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(USER_REFRESH_KEY)
}

export function clearUserToken() {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_REFRESH_KEY);
}


export function setUserToken(token) {
    localStorage.setItem(USER_TOKEN_KEY, token);
}

export function setRefreshToken(token) {
    localStorage.setItem(USER_REFRESH_KEY, token)
}

export function isLoggedIn() {
    const userToken = getUserToken();
    return !!userToken;
}



