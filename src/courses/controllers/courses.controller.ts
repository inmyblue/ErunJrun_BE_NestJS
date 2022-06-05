import { JwtPassGuard } from 'src/user/guards/jwt.pass.guard';
import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    HttpException,
    UseInterceptors,
    Post,
    Body,
    UploadedFiles,
    Delete,
    Patch,
} from '@nestjs/common';
import { CoursesService } from '../services/courses.service';
import { GetUser } from 'src/user/auth.user.decorator';
import { Users } from 'src/models/entities/Users';
import { JwtAuthGuard } from 'src/user/guards/jwt.auth.guard';
import { courseOption, multerOption } from 'src/common/middlewares/multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CourseCreateDto } from '../dto/course.create.dto';

@Controller('course')
export class CoursesController {
    constructor(private readonly courseService: CoursesService) {}

    @UseGuards(JwtPassGuard)
    @Get(':category')
    async getCourse(
        @Param('category') category: string,
        @Query() query: { [key: string]: string },
        @GetUser() user: Users,
    ): Promise<object> {
        const data = await this.courseService.getCourse(category, query, user);

        return { success: true, data };
    }

    @UseGuards(JwtPassGuard)
    @Get('/detail/:courseId')
    async getDetailCourse(
        @Param('courseId') courseId: string,
        @GetUser() user: Users,
    ): Promise<object> {
        const data = await this.courseService.getDetailCourse(courseId, user);
        return { success: true, data };
    }

    @UseGuards(JwtPassGuard)
    @Get('/:courseId/starPoint')
    async getStar(
        @Param('courseId') courseId: string,
        @GetUser() user: Users,
    ): Promise<object> {
        const data = await this.courseService.getStar(courseId, user);
        return { success: true, data };
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('courseImage', 3, courseOption))
    @Post('/')
    async createCourse(
        @Body() data: CourseCreateDto,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @GetUser() user: Users,
    ): Promise<object> {
        const { userId } = user;

        try {
            for (let i = 0; i < files.length; i++) {
                data[`courseImageUrl${i + 1}`] = files[i]['key'];
            }

            data['userId'] = userId;
            await this.courseService.createCourse(data);
            return {
                success: true,
                message: '게시물이 등록되었습니다',
            };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:courseId')
    async deleteCourse(
        @Param('courseId') courseId: string,
        @GetUser() user: Users,
    ) {
        try {
            await this.courseService.deleteCourse(courseId, user.userId);
            return {
                success: true,
                message: '게시물이 삭제되었습니다',
            };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:courseId/bookmark')
    async bookmark(
        @Param('courseId') courseId: string,
        @GetUser() user: Users,
    ) {
        try {
            const state = await this.courseService.bookmark(
                courseId,
                user.userId,
            );
            return { success: true, data: { bookmark: state } };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:courseId/starPoint')
    async starpoint(
        @Param('courseId') courseId: string,
        @Body() body: number,
        @GetUser() user: Users,
    ) {
        try {
            await this.courseService.updateStar(
                courseId,
                user.userId,
                body['myStarPoint'],
            );
            const data = await this.courseService.getStar(courseId, user);
            return { success: true, data };
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }
}
