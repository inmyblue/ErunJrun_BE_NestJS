import { Injectable, HttpException, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { Users } from 'src/models/entities/Users';
import { UserCreateDto } from '../dto/user.create.dto';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class UserService {
    constructor(
        private jwtService: JwtService,
        private readonly userRepository: UserRepository,
    ) {}

    async callbackKakao(code: string): Promise<object> {
        try {
            const getToken: { [key: string]: string } = await axios.get(
                'https://kauth.kakao.com/oauth/token',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    params: {
                        grant_type: 'authorization_code',
                        client_id: process.env.KAKAO_ID,
                        redirect_uri: process.env.KAKAO_CALLBACK,
                        code,
                    },
                },
            );

            const getData: { [key: string]: string } = await axios.get(
                'https://kapi.kakao.com/v2/user/me',
                {
                    headers: {
                        Authorization: `Bearer ${getToken.data['access_token']}`,
                    },
                },
            );

            const socialId: string = getData.data['id'];
            const nickname: string = getData.data['properties']['nickname'];
            const profileUrl: string =
                getData.data['properties']['profile_image'];
            const data: UserCreateDto = {
                social: 'kakao',
                socialId,
                nickname,
                profileUrl,
            };

            let getUser: Users = await this.userRepository.getUserBySocial(
                'kakao',
                socialId,
            );

            if (!getUser) {
                await this.userRepository.createUser(data);
                getUser = await this.userRepository.getUserBySocial(
                    'kakao',
                    socialId,
                );
            }

            let firstLogin: boolean = false;
            if (!getUser.likeDistance && !getUser.likeLocation)
                firstLogin = true;

            const accessToken = this.createAccessToken(getUser.userId);

            const refreshToken = this.jwtService.sign(
                { social: getUser.social, socialId: getUser.socialId },
                {
                    secret: process.env.REFRESHKEY,
                    expiresIn: process.env.VALID_REFRESH_TOKEN_TIME,
                },
            );

            return {
                success: false,
                token: accessToken,
                refreshToken,
                userId: getUser.userId,
                nickname: getUser.nickname,
                profileUrl: getUser.profileUrl,
                firstLogin,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(error, 400);
        }
    }

    createAccessToken(userId: string) {
        return this.jwtService.sign(
            { userId },
            {
                secret: process.env.TOKENKEY,
                expiresIn: process.env.VALID_ACCESS_TOKEN_TIME,
            },
        );
    }

    deleteUser(userId: string) {
        return this.userRepository.deleteUser(userId);
    }
}
