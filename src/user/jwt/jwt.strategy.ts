import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../repository/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userRepository: UserRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.TOKENKEY,
            ignoreExpiration: true,
        });
    }

    // async validate(payload) {
    //     const userId = payload.userId;
    //     try {
    //         const getUser = await this.userRepository.getUserById(userId);

    //         if (!getUser)
    //             throw new UnauthorizedException(
    //                 '토큰에 해당하는 유저가 없습니다',
    //             );
    //         return getUser;
    //     } catch (error) {
    //         throw new UnauthorizedException('인증 오류가 발생했습니다');
    //     }
    // }
}
