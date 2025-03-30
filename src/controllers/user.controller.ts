import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { ITokenPayload } from "../interfaces/token.interface";
import { IUser, IUserListQuery } from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { userService } from "../service/user.service";

class UserController {
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as IUserListQuery;
      const result = await userService.getListUsers(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.userId;
      const user = await userService.getById(id);
      const result = userPresenter.toPublicResDto(user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const user = await userService.getMe(jwtPayload);
      const result = userPresenter.toPublicResDto(user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  public async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const dto = req.body as IUser;
      const user = await userService.updateMe(jwtPayload, dto);

      const result = userPresenter.toPublicResDto(user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  public async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const result = await userService.deleteMe(jwtPayload);
      res.status(204).json(result);
    } catch (error) {
      next(error);
    }
  }

  public async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const file = req.files.avatar as UploadedFile;

      const user = await userService.uploadAvatar(jwtPayload, file);
      const result = userPresenter.toPublicResDto(user);
      res.status(204).json(result);
    } catch (error) {
      next(error);
    }
  }

  public async deleteAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      const result = await userService.deleteAvatar(jwtPayload);

      res.status(204).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
