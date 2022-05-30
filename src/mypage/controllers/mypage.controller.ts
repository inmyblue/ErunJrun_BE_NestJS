import { JwtAuthGuard } from 'src/user/guards/jwt.auth.guard';
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { MypageService } from '../services/mypage.service';
import { GetUser } from 'src/user/auth.user.decorator';
import { Users } from 'src/models/entities/Users';
import { FilesInterceptor } from '@nestjs/platform-express';
import { profileOption } from 'src/common/middlewares/multer';

@Controller('auth')
export class MypageController {
    constructor(private readonly mypageService: MypageService) {}

    @Get('/info/:userId')
    async getUserInfo(@Param('userId') userId: string) {
        const data = await this.mypageService.getUserInfo(userId);
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard)
    @Get('/updateUser')
    async getUserForUpdate(@GetUser() user: Users) {
        const data = await this.mypageService.getUserForUpdate(user.userId);

        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('image', 1, profileOption))
    @Patch('/updateUser')
    async updateUser(
        @GetUser() user: Users,
        @Body() body: object,
        @UploadedFiles() files: Array<Express.Multer.File>,
    ) {
        if (files.length !== 0) {
            console.log(files);
            body['profileUrl'] = files[0]['location'];
        } else {
            body['profileUrl'] = body['image'];
            delete body['image'];
        }

        this.mypageService.updateUser(user.userId, body);
        return { success: true, message: '프로필 수정에 성공하였습니다' };
    }

    @UseGuards(JwtAuthGuard)
    @Patch('userLike')
    addUserData(@GetUser() user: Users, @Body() body: object) {
        this.mypageService.addUserData(user.userId, body);
        return { success: true, message: '프로필 수정에 성공하였습니다' };
    }
}
