import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from 'src/models/entities/Courses';
import { Users } from 'src/models/entities/Users';
import { CoursesController } from './controllers/courses.controller';
import { CoursesService } from './services/courses.service';
import { CourseRepository } from './repository/courses.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Courses, Users]), UserModule],
    controllers: [CoursesController],
    providers: [CoursesService, CourseRepository],
})
export class CoursesModule {}
