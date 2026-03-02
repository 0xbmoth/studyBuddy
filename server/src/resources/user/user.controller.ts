import Controller from "@/utils/interfaces/controller.interface";
import UserService from "./user.service";
import { Router, Request, Response } from "express";
import validationMiddleware from "@/middleware/validation.middleware";
import validate from "@/resources/user/user.validation";
import { NextFunction } from "express-serve-static-core";
import HttpException from "@/utils/exceptions/http.exception";
import authenticatedMiddleware from "@/middleware/authenticated.middleware";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateRefreshToken } from "@/utils/token";

class UserController implements Controller {
  public path = "/users";
  public router = Router();
  private UserService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(validate.register),
      this.register,
    ),
      this.router.post(
        `${this.path}/login`,
        validationMiddleware(validate.login),
        this.login,
      );
    this.router.get(`${this.path}`, authenticatedMiddleware, this.getUser);
    this.router.put(
      `${this.path}/titles`,
      authenticatedMiddleware,
      this.postTitle,
    );
    this.router.post(`${this.path}/refresh`, this.refreshToken);
  }

  private refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new HttpException(400, "Refresh token is required");
      }

      const newAccessToken = await this.UserService.refreshToken(refreshToken);

      const payload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
      ) as JwtPayload;
      const newRefreshToken = generateRefreshToken(payload._id);

      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(new HttpException(400, (error as Error).message));
    }
  };

  private login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { email, password } = req.body;
      const token = await this.UserService.login(email, password, req);

      res.status(200).json({ token });
    } catch (error: any) {
        if (error instanceof HttpException) {
            return next(error);
        }

        next(new HttpException(400, error.message || 'Unable to log in'));
    }
  };

  private register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { username, email, password } = req.body;

      console.log(req.body)

      const token = await this.UserService.register(
        username,
        email,
        password,
        "user",
      );

      res.status(201).json({ token });
    } catch (error: any) {
       if (error instanceof HttpException) {
            return next(error);
        }

        next(new HttpException(400, error.message || 'Unable to register'));
    }
  };

  private getUser = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response | void => {
    // @ts-ignore
    if (!req.user) {
      return next(new HttpException(404, "Not Logged In User"));
    }

    // @ts-ignore
    res.status(200).json({ user: req.user });
  };

  private postTitle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { title } = req.body;

      // @ts-ignore
      const userId = req.user._id;

      const user = await this.UserService.findUserById(userId);

      if (!user) {
        return next(new HttpException(404, "User not found"));
      }

      user.titles.push(title);

      try {
        await user.save();
        return res
          .status(201)
          .json({ message: "Title added successfully", title });
      } catch (saveError) {
        console.log("Error in post title:", saveError);

        return next(new HttpException(500, (saveError as Error).message));
      }
    } catch (error) {
      next(new HttpException(400, (error as Error).message));
    }
  };
}

export default UserController;
