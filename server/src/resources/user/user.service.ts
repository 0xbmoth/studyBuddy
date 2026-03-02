import userModel from "@/resources/user/user.model";
import HttpException from "@/utils/exceptions/http.exception";
import token, { TokenResponse } from "@/utils/token";
import { Request } from "express";
import User from "./user.interface";

class UserService {
  private user = userModel;

  /**
   * Register a new user
   */

  public async register(
    username: string,
    email: string,
    password: string,
    role: string,
  ): Promise<TokenResponse | Error> {
    try {
      const user = await this.user.create({ username, email, password, role });
      console.log(user)

      const accessToken = token.createToken(user);

      return accessToken;
    } catch (error: any) {
      /* Duplicate Email/Username (MongoDB Error 11000). */
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new HttpException(409, `That ${field} is already in use.`);
      }

      /* Mongoose Validation Errors (e.g., password too short). */
      if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map((val: any) => val.message).join(', ');
        throw new HttpException(400, message);
      }

      /* Fallback for unexpected errors. */
      throw new HttpException(400, "Unable to create account. Please try again later.");
    }
  }

  /**
   * Login a new user
   */

  public async login(
    email: string,
    password: string,
    req: Request,
  ): Promise<TokenResponse> {
    try {
      const user = await this.user.findOne({ email: email });

      if (!user) throw new HttpException(404, "Unable to find a user with that email");

      const isPasswordValid = await user.isValidPassword(password);

      if (isPasswordValid) {
        // @ts-ignore
        req.user = user;
        const tokens: TokenResponse = token.createToken(user);
        return tokens;
      } else throw new HttpException(401, "Incorrect Password");
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(500, "Internal Server Error during login");
    }
  }

  public async findUserById(userId: string): Promise<User | null> {
    try {
      return await this.user.findById(userId).exec();
    } catch (error) {
      throw new HttpException(400, (error as Error).message);
    }
  }

  public async refreshToken(refreshToken: string): Promise<string | Error> {
    try {
      const access = await token.refreshAccessToken(refreshToken);

      return access;
    } catch (error) {
      throw new HttpException(400, (error as Error).message);
    }
  }
}

export default UserService;
