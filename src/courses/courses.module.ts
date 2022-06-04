import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from 'src/models/entities/Courses';
import { Users } from 'src/models/entities/Users';
import { CoursesController } from './controllers/courses.controller';
import { CoursesService } from './services/courses.service';
import { CourseRepository } from './repository/courses.repository';
import { Bookmarks } from 'src/models/entities/Bookmarks';
import { Comments } from 'src/models/entities/Comments';
import { Starpoint } from 'src/models/entities/Starpoint';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Courses,
            Users,
            Bookmarks,
            Comments,
            Starpoint,
        ]),
        UserModule,
    ],
    controllers: [CoursesController],
    providers: [CoursesService, CourseRepository],
})
export class CoursesModule {}
