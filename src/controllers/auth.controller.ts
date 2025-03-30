import { NextFunction, Request, Response } from "express";

import { ITokenPayload } from "../interfaces/token.interface";
import {
  IChangePassword,
  IResetPasswordChange,
  IResetPasswordSend,
  ISignIn,
  IUser,
} from "../interfaces/user.interface";
import { authService } from "../service/auth.service";

class AuthController {
  public async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IUser;
      const data = await authService.signUp(dto);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  public async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as ISignIn;
      const data = await authService.signIn(dto);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.res.locals.refreshToken as string;
      const jwTPayload = req.res.locals.jwtPayload as ITokenPayload;

      const result = await authService.refresh(refreshToken, jwTPayload);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  public async logOutDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenId = req.res.locals.tokenId as string;
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      await authService.logOutDevice(tokenId, jwtPayload);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  public async logOutManyDevices(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      await authService.logOutAllDevices(jwtPayload);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  public async forgotPasswordSendEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const dto = req.body as IResetPasswordSend;
      await authService.forgotPasswordSendEmail(dto);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  public async forgotPasswordChange(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const dto = req.body as IResetPasswordChange;

      await authService.forgotPasswordChange(dto, jwtPayload);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  public async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      await authService.verify(jwtPayload);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const dto = req.body as IChangePassword;

      await authService.changePassword(jwtPayload, dto);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
