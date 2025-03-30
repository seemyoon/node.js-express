import { UploadedFile } from "express-fileupload";

import { FileItemTypeEnum } from "../enums/file-item-type.enum";
import { ApiError } from "../errors/customApiError";
import { ITokenPayload } from "../interfaces/token.interface";
import {
  IUser,
  IUserListQuery,
  IUserListResponse,
} from "../interfaces/user.interface";
import { userPresenter } from "../presenters/user.presenter";
import { userRepository } from "../repository/user.repository";
import { awsS3Service } from "./aws.s3.service";

class UserService {
  public async getListUsers(query: IUserListQuery): Promise<IUserListResponse> {
    const [entities, total] = await userRepository.getListUsers(query);
    return userPresenter.toListResDto(entities, total, query);
  }

  public async getById(userId: string): Promise<IUser> {
    const user = await userRepository.getById(userId);
    if (!user) throw new ApiError("User not found", 404);
    return user;
  }

  public async getMe(jwtPayload: ITokenPayload): Promise<IUser> {
    const user = await userRepository.getById(jwtPayload.userId);
    if (!user) throw new ApiError("User not found", 404);
    return user;
  }

  public async updateMe(
    jwtPayload: ITokenPayload,
    dto: Partial<IUser>,
  ): Promise<IUser> {
    return await userRepository.updateById(jwtPayload.userId, dto);
  }

  public async deleteMe(jwtPayload: ITokenPayload): Promise<void> {
    return await userRepository.deleteById(jwtPayload.userId);
  }

  public async uploadAvatar(
    jwtPayload: ITokenPayload,
    file: UploadedFile,
  ): Promise<IUser> {
    const user = await userRepository.getById(jwtPayload.userId);

    const avatar = await awsS3Service.uploadFile(
      file,
      FileItemTypeEnum.USER,
      user._id,
    );

    const updatedUser = await userRepository.updateById(user._id, { avatar });
    if (user.avatar) {
      await awsS3Service.deleteFile(user.avatar);
    }
    return updatedUser;
  }

  public async deleteAvatar(jwtPayload: ITokenPayload): Promise<IUser> {
    const user = await userRepository.getById(jwtPayload.userId);

    if (user.avatar) await awsS3Service.deleteFile(user.avatar);

    return await userRepository.updateById(user._id, { avatar: null });
  }
}

export const userService = new UserService();
