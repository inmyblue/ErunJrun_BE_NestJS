import { UserRepository } from './../repository/user.repository';
import {
    ExecutionContext,
    Injectable,
    HttpException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../services/user.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private jwtService: JwtService,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        try {
            const request = context.switchToHttp().getRequest();
            const { authorization } = request.headers;

            if (!authorization)
                throw new UnauthorizedException('로그인 후 사용할 수 있습니다');

            const [tokenType, tokenValue] = authorization.split(' ');
            if (tokenType !== 'Bearer')
                throw new UnauthorizedException('토큰정보가 잘못되었습니다');

            if (tokenValue === 'undefined') {
                throw new UnauthorizedException('로그인 후 사용할 수 있습니다');
            }

            const payload: any = jwt.verify(tokenValue, process.env.TOKENKEY);
            request.user = await this.userRepository.getUserById(
                payload.userId,
            );
            return true;
        } catch (error) {
            try {
                if (error.name === 'TokenExpiredError') {
                    const request = context.switchToHttp().getRequest();
                    const reAuthorization = request.headers.reauthorization;

                    if (
                        !reAuthorization ||
                        reAuthorization === 'Bearer undefined'
                    )
                        throw new UnauthorizedException(
                            '로그인 후 사용할 수 있습니다',
                        );
                    const [reTokenType, reTokenValue] =
                        reAuthorization.split(' ');

                    if (reTokenType !== 'Bearer')
                        throw new UnauthorizedException(
                            '리프레쉬토큰정보가 잘못되었습니다',
                        );

                    const rePayload: any = await jwt.verify(
                        reTokenValue,
                        process.env.REFRESHKEY,
                    );

                    const user = await this.userRepository.getUserBySocial(
                        rePayload.social,
                        rePayload.socialId,
                    );

                    const accessToken = this.userService.createAccessToken(
                        user.userId,
                    );

                    throw new HttpException({ token: accessToken }, 400);
                } else {
                    throw new UnauthorizedException(error.message);
                }
            } catch (error) {
                if (error.name === 'HttpException') {
                    throw new HttpException({ ...error.response }, 400);
                } else {
                    throw new UnauthorizedException(
                        '로그인 오류. 다시 로그인해주세요',
                    );
                }
            }
        }
    }
}
