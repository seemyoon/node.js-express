import { configs } from "../config/config";
import { IUser, IUserListQuery } from "../interfaces/user.interface";

class UserPresenter {
  public toPublicResDto(user: IUser) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      avatar: user.avatar ? `${configs.AWS_S3_ENDPOINT}/${user.avatar}` : null,
      role: user.role,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
    };
  }
  public toListResDto(entities: IUser[], total: number, query: IUserListQuery) {
    return {
      data: entities.map(this.toPublicResDto),
      total,
      ...query,
    };
  }
}

export const userPresenter = new UserPresenter();
