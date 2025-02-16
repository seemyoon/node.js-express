import {RoleEnum} from "../enums/role.enum";

export interface IToken {
    _id?: string;
    accessToken: string;
    refreshToken: string;
    _userId: string;
    createAt: Date;
    update: Date
}

export interface ITokenPayload{
    userId: string,
    role: RoleEnum
}

export interface ITokenPair{
    accessToken: string;
    refreshToken: string;
}