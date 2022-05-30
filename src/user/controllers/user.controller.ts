import { GetUser } from './../auth.user.decorator';
import { Controller, Delete, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.auth.guard';
import { UserService } from '../services/user.service';
import { Users } from 'src/models/entities/Users';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/kakao/callback')
    callbackKaKao(@Query() query): Promise<object> {
        return this.userService.callbackKakao(query.code);
    }

    @Get('/auth')
    @UseGuards(JwtAuthGuard)
    authUser(@GetUser() user: Users) {
        return {
            success: true,
            userId: user.userId,
            nickname: user.nickname,
            profileUrl: user.profileUrl,
        };
    }

    @Delete('/logout')
    @UseGuards(JwtAuthGuard)
    logout() {
        return { success: true, message: '로그아웃 되었습니다' };
    }

    @Delete('/delete')
    @UseGuards(JwtAuthGuard)
    async deleteUser(@GetUser() user: Users) {
        const { userId } = user;
        await this.userService.deleteUser(userId);
    }
}
