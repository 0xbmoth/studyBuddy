import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:3000/api";

interface TokenResponse {
  token: TokenResponse;
  accessToken: string;
  refreshToken: string;
}

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

class AuthService {
  private static instance: AuthService;

  private constructor() {
    // Set up axios interceptors
    axiosInstance.interceptors.request.use(
      (request) => {
        const accessToken = this.getAccessToken();
        if (accessToken) {
          request.headers["Authorization"] = `Bearer ${accessToken}`;

          if (this.isTokenExpired(accessToken)) {
            return this.refreshToken().then((newAccessToken) => {
              request.headers["Authorization"] = `Bearer ${newAccessToken}`;
              return request;
            });
          }
        }

        return request;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axiosInstance.interceptors.response.use(
      (response) => response, // Directly return successful responses.
      async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
          return Promise.reject(error);
        }

        if (
          error.response.data?.message?.includes("Invalid Token") ||
          error.response.data?.name === "TokenVerificationError"
        ) {
          if (!originalRequest._invalidTokenHandled) {
            originalRequest._invalidTokenHandled = true;
            window.location.reload();
            return Promise.reject(error);
          }
        }

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            const response = await axios.post<TokenResponse>(
              `${API_URL}/users/refresh`,
              { refreshToken: refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } =
              response.data;
            this.setAccessToken(accessToken);
            this.setRefreshToken(newRefreshToken);

            // Update the authorization header with the new access token.
            axiosInstance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
            console.error("Token refresh failed:", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token found.");
      }

      const response = await axios.post<TokenResponse>(
        `${API_URL}/users/refresh`,
        {
          refreshToken,
        }
      );

      this.setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error("Failed to refresh token.");
    }
  }

  public async login(email: string, password: string): Promise<void> {
    try {
      const response = await axios.post<TokenResponse>(
        `${API_URL}/users/login`,
        {
          email,
          password,
        }
      );

      this.setTokens(response.data.token as TokenResponse);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  private setAccessToken(accessToken: string) {
    localStorage.setItem("accessToken", accessToken);
  }

  private setRefreshToken(refreshToken: string) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  private setTokens(tokens: TokenResponse) {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }

  private getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  private isTokenExpired(accessToken: string) {
    const { exp } = jwtDecode<{ exp: number }>(accessToken);
    return Date.now() >= exp * 1000;
  }
}

export default AuthService.getInstance();
