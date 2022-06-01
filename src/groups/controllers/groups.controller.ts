import { JwtAuthGuard } from './../../user/guards/jwt.auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    UseInterceptors,
    UploadedFiles,
    Param,
    Query,
    HttpException,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { GroupsService } from '../services/groups.service';
import { GroupCreateDto } from '../dto/group.create.dto';
import { multerOption } from '../../common/middlewares/multer';
import { GroupUpdateDto } from '../dto/group.update.dto';
import { GetUser } from 'src/user/auth.user.decorator';
import { Users } from 'src/models/entities/Users';
import { JwtPassGuard } from 'src/user/guards/jwt.pass.guard';

@Controller('group')
export class GroupsController {
    constructor(private readonly groupService: GroupsService) {}

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('thumbnail', 3, multerOption))
    @Post()
    async createPost(
        @Body() data: GroupCreateDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @GetUser() user: Users,
    ): Promise<object> {
        const { userId } = user;

        try {
            if (files) {
                for (let i = 0; i < files.length; i++) {
                    data[`thumbnailUrl${i + 1}`] = files[i]['key'];
                }
            }
            data['userId'] = userId;
            await this.groupService.createPost(data);
            return {
                success: true,
                message: '게시물이 등록되었습니다',
            };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @UseGuards(JwtPassGuard)
    @Get(':category')
    async getGroup(
        @Param('category') category: string,
        @Query() query: { [key: string]: string },
        @GetUser() user: Users,
    ): Promise<object> {
        let userId = '';
        //if (user) userId = user.userId;
        switch (category) {
            case 'mypage':
            case 'complete':
                if (!query.userId)
                    throw new HttpException('잘못된 유저입니다', 400);
                break;
            case 'all':
            case 'main':
                if (user) userId = user.userId;
                break;
            case 'prefer':
                if (!user)
                    throw new HttpException(
                        '로그인 후 사용할 수 있습니다',
                        400,
                    );
                userId = user.userId;
                break;
        }

        const data = await this.groupService.getGroup(category, query, userId);
        if (data['preferData']) return { success: true, ...data };
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('thumbnail', 3, multerOption))
    @Patch(':groupId')
    async updatePost(
        @Param('groupId') groupId: string,
        @Body() data: GroupUpdateDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @GetUser() user: Users,
    ) {
        const { userId } = user;

        try {
            data.files = files;
            await this.groupService.updatePost(groupId, userId, data);

            return {
                success: true,
                meesage: '게시물이 수정되었습니다',
            };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':groupId')
    async deletePost(
        @Param('groupId') groupId: string,
        @GetUser() user: Users,
    ) {
        const { userId } = user;

        try {
            await this.groupService.deletePost(groupId, userId);

            return {
                success: true,
                message: '게시물이 삭제되었습니다',
            };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @UseGuards(JwtPassGuard)
    @Get('/detail/:groupId')
    async getGroupDetail(
        @Param('groupId') groupId: string,
        @GetUser() user: Users,
    ) {
        let userId = '';
        if (user) userId = user.userId;

        try {
            const data = await this.groupService.getGroupDetail(
                groupId,
                userId,
            );

            return {
                success: true,
                data,
            };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/:groupId/apply')
    async applyGroup(
        @Param('groupId') groupId: string,
        @GetUser() user: Users,
    ) {
        const { userId, nickname } = user;
        try {
            const data = await this.groupService.applyGroup(
                groupId,
                userId,
                nickname,
            );
            return { success: true, data };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/attendance/:groupId')
    async getAttendance(
        @GetUser() user: Users,
        @Param('groupId') groupId: string,
    ) {
        const data = await this.groupService.getAttendance(
            groupId,
            user.userId,
        );

        return {
            success: true,
            applyUser: data['applyUser'],
            groupInfo: data['groupInfo'],
        };
    }
}
