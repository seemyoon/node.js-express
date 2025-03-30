import {configs} from "../config/config";
import {ActionTokenTypeEnum} from "../enums/actionTokenType.enum";
import {EmailTypeEnum} from "../enums/email.enum";
import {ApiError} from "../errors/customApiError";
import {ITokenPair, ITokenPayload} from "../interfaces/token.interface";
import {IChangePassword, IResetPasswordChange, IResetPasswordSend, IUser} from "../interfaces/user.interface";
import {actionTokenRepository} from "../repository/action-token.repository";
import {oldPasswordRepository} from "../repository/old-password.repository";
import {tokenRepository} from "../repository/token.repository";
import {userRepository} from "../repository/user.repository";
import {emailService} from "./email.service";
import {passwordService} from "./password.service";
import {tokenService} from "./token.service";

class AuthService {
    public async signUp(dto: Partial<IUser>): Promise<{ user: IUser, tokens: ITokenPair }> {
        await this.isEmailExistOrThrow(dto.email);
        const password = await passwordService.hashPassword(dto.password);
        const user = await userRepository.create({...dto, password});
        const tokens = tokenService.generateTokens({userId: user._id, role: user.role});
        await tokenRepository.create({...tokens, _userId: user._id});
        const token = tokenService.generateActionTokens({
            userId: user._id,
            role: user.role,
        }, ActionTokenTypeEnum.VERIFY_EMAIL);
        await actionTokenRepository.create({_userId: user._id, type: ActionTokenTypeEnum.VERIFY_EMAIL, token});
        // await emailService.sendMail(configs.SMTP_EMAIL, EmailTypeEnum.WELCOME,
        //     {
        //         name: user.name,
        //         actionToken: token
        //     })
        return {user, tokens};
    }


    public async signIn(dto: Partial<IUser>): Promise<{ user: IUser, tokens: ITokenPair }> {
        const user = await userRepository.getByEmail(dto.email);
        if (!user) throw new ApiError("User not found", 404);

        const isPasswordMatch = await passwordService.comparePassword(dto.password, user.password);
        if (!isPasswordMatch) throw new ApiError("Invalid fields", 401);

        const tokens = tokenService.generateTokens({userId: user._id, role: user.role});

        await tokenRepository.create({...tokens, _userId: user._id});
        return {user, tokens};
    }

    public async refresh(refreshToken: string, payload: ITokenPayload): Promise<ITokenPair> {
        await tokenRepository.deleteByParams({refreshToken});

        const tokens = tokenService.generateTokens({userId: payload.userId, role: payload.role});

        await tokenRepository.create({...tokens, _userId: payload.userId});
        return tokens;
    }

    public async logOutDevice(tokenId: string, jwtPayload: ITokenPayload): Promise<void> {
        const user = await userRepository.getById(jwtPayload.userId);
        await tokenRepository.deleteByParams({_id: tokenId});
        await emailService.sendMail(configs.SMTP_EMAIL, EmailTypeEnum.LOGOUT, {name: user.name});

    }


    public async logOutAllDevices(jwtPayload: ITokenPayload): Promise<void> {
        const user = await userRepository.getById(jwtPayload.userId);
        await tokenRepository.deleteManyByParams({_userId: user._id});
        await emailService.sendMail(configs.SMTP_EMAIL, EmailTypeEnum.LOGOUT, {name: user.name});
    }

    public async forgotPasswordSendEmail(dto: IResetPasswordSend): Promise<void> {
        const user = await userRepository.getByEmail(dto.email);
        if (!user) throw new ApiError("User not found", 404);
        const token = tokenService.generateActionTokens({
            userId: user._id,
            role: user.role
        }, ActionTokenTypeEnum.FORGOT_PASSWORD);
        await actionTokenRepository.create({
            type: ActionTokenTypeEnum.FORGOT_PASSWORD,
            _userId: user._id,
            token,
        });
        await emailService.sendMail(configs.SMTP_EMAIL, EmailTypeEnum.FORGOT_PASSWORD, {
            name: user.name,
            email: user.email,
            actionToken: token,
        });
    }

    public async forgotPasswordChange(dto: IResetPasswordChange, jwtPayload: ITokenPayload): Promise<void> {
        const user = await userRepository.getById(jwtPayload.userId);
        const oldPasswords = await oldPasswordRepository.findByParams(user._id);

        await Promise.all(oldPasswords.map(async (oldPassword) => {
            const isPrevious = await passwordService.comparePassword(dto.password, oldPassword.password);
            if (isPrevious) throw new ApiError("Password already used", 409);
        }));

        const password = await passwordService.hashPassword(dto.password);
        await userRepository.updateById(jwtPayload.userId, {password});
        await oldPasswordRepository.create({
            _userId: jwtPayload.userId,
            password: user.password
        });
        await actionTokenRepository.deleteManyByParams({
            _userId: jwtPayload.userId,
            type: ActionTokenTypeEnum.FORGOT_PASSWORD
        });

        await tokenRepository.deleteManyByParams({_userId: jwtPayload.userId});
    }

    public async verify(jwtPayload: ITokenPayload): Promise<void> {
        await userRepository.updateById(jwtPayload.userId, {isVerified: true});

        await actionTokenRepository.deleteManyByParams({
            _userId: jwtPayload.userId,
            type: ActionTokenTypeEnum.VERIFY_EMAIL
        });
        await tokenRepository.deleteManyByParams({_userId: jwtPayload.userId});
    }

    public async changePassword(jwtPayload: ITokenPayload, dto: IChangePassword): Promise<void> {
        const user = await userRepository.getById(jwtPayload.userId);
        const passwordCorrect = await passwordService.comparePassword(dto.oldPassword, user.password);

        if (!passwordCorrect) throw new ApiError("Invalid previous password", 401);
        const oldPasswords = await oldPasswordRepository.findByParams(user._id);

        const passwords = [...oldPasswords, {password: user.password}];
        await Promise.all(passwords.map(async (oldPassword) => {
            const isPrevious = await passwordService.comparePassword(
                dto.password,
                oldPassword.password,
            );
            if (isPrevious) {
                throw new ApiError("Password already used", 409);
            }
        }));
        const password = await passwordService.hashPassword(dto.password);
        await userRepository.updateById(jwtPayload.userId, {password});
        await oldPasswordRepository.create({
            _userId: jwtPayload.userId,
            password: user.password,
        });
        await tokenRepository.deleteManyByParams({_userId: jwtPayload.userId});

    }

    private async isEmailExistOrThrow(email: string): Promise<void> {
        const user = await userRepository.getByEmail(email);
        if (user) throw new ApiError("User already exists", 409);
    }
}

export const authService = new AuthService();
