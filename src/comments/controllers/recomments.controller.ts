import { JwtAuthGuard } from './../../user/guards/jwt.auth.guard';
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ReCommentsService } from '../services/recomments.service';
import { Users } from 'src/models/entities/Users';
import { GetUser } from 'src/user/auth.user.decorator';

@Controller('recomment')
export class ReCommentsController {
    constructor(private readonly recommentService: ReCommentsService) {}

    @Get(':commentId')
    async getRecomment(@Param('commentId') commentId: string) {
        const data = await this.recommentService.getRecomment(commentId);
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard)
    @Post(':commentId')
    async postRecomment(
        @Param('commentId') commentId: string,
        @Body() body: { [key: string]: string },
        @GetUser() user: Users,
    ) {
        const data = await this.recommentService.postRecomment(
            commentId,
            body.content,
            user.userId,
        );

        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':recommentId')
    async updateRecomment(
        @Param('recommentId') recommentId: string,
        @Body() body: { [key: string]: string },
        @GetUser() user: Users,
    ) {
        const data = await this.recommentService.updateRecomment(
            recommentId,
            body.content,
            user.userId,
        );

        return { success: true, data };
    }
}
