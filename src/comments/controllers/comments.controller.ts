import { JwtAuthGuard } from './../../user/guards/jwt.auth.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../services/comments.service';
import { GetUser } from 'src/user/auth.user.decorator';
import { Users } from 'src/models/entities/Users';
import { UserRepository } from 'src/user/repository/user.repository';

@Controller('comment')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly userRepository: UserRepository,
    ) {}

    @Get(':category/:categoryId')
    async getComments(
        @Param('category') category: string,
        @Param('categoryId') categoryId: string,
    ) {
        const data = await this.commentsService.getComments(
            category,
            categoryId,
        );
        return {
            success: true,
            data,
        };
    }

    @Post(':category/:categoryId')
    @UseGuards(JwtAuthGuard)
    async postComment(
        @Param('category') category: string,
        @Param('categoryId') categoryId: string,
        @GetUser() user: Users,
        @Body() body: { content: string },
    ) {
        const { userId, userLevel, nickname, profileUrl } = user;
        const input = {
            category,
            categoryId,
            content: body.content,
            userId,
        };

        const data = await this.commentsService.postComment(input);

        return {
            success: true,
            data,
        };
    }

    @Patch(':commentId')
    @UseGuards(JwtAuthGuard)
    async updateComment(
        @Param('commentId') commentId: string,
        @GetUser() user: Users,
        @Body() body: { [key: string]: string },
    ) {
        const data = await this.commentsService.updateComment(
            commentId,
            user.userId,
            body.content,
        );
        return { success: true, data };
    }

    @Delete(':commentId')
    @UseGuards(JwtAuthGuard)
    async deleteComment(
        @Param('commentId') commentId: string,
        @GetUser() user: Users,
    ) {
        await this.commentsService.deleteComment(commentId, user.userId);
        return { success: true, message: '댓글이 삭제되었습니다' };
    }
}
