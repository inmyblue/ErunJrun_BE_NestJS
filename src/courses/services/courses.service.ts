import { Injectable, HttpException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { deleteCourse, deleteImg } from 'src/common/middlewares/multer';
dayjs.locale('ko');
import { Users } from 'src/models/entities/Users';
import { CourseCreateDto } from '../dto/course.create.dto';
import { CourseRepository } from '../repository/courses.repository';

@Injectable()
export class CoursesService {
    constructor(private readonly courseRepository: CourseRepository) {}

    async getCourse(category: string, query, user: Users): Promise<object> {
        let feed;
        switch (category) {
            case 'all':
                feed = await this.courseRepository.getCourse(query, user, '');

                const rankingFeed = await this.courseRepository.getCourse(
                    query,
                    user,
                    'rank',
                );

                if (user) {
                    return {
                        feed,
                        rankingFeed,
                        preferData: user.likeLocation,
                    };
                } else {
                    return {
                        feed,
                        rankingFeed,
                    };
                }

            case 'main':
                feed = await this.courseRepository.getCourse(
                    query,
                    user,
                    'main',
                );
                return {
                    feed,
                };
            case 'mypage':
                feed = await this.courseRepository.getCourse(
                    query,
                    user,
                    'mypage',
                );
                return {
                    feed,
                };
            case 'bookmark':
                feed = await this.courseRepository.getCourse(
                    query,
                    user,
                    'bookmark',
                );
                return {
                    feed,
                };
        }
    }

    getDetailCourse(courseId: string, user: Users): Promise<object> {
        try {
            return this.courseRepository.getDetailCourse(courseId, user);
        } catch (error) {
            console.log(error);
            throw new HttpException('????????? ??????????????? ?????????????????????', 400);
        }
    }

    async getStar(courseId: string, user: Users): Promise<object> {
        try {
            let myStarPoint: number;
            if (user) {
                const myStar = await this.courseRepository.getMyStar(
                    courseId,
                    user.userId,
                );
                if (!myStar) myStarPoint = 0;
                else myStarPoint = myStar.myStarPoint;
            } else {
                myStarPoint = 0;
            }

            const starPeople = await this.courseRepository.getStarNumByCourseId(
                courseId,
            );

            const starPoint = await this.courseRepository.getCourseByCourseId(
                courseId,
            );

            return {
                myStarPoint,
                starPeople,
                starPoint: starPoint.starPoint,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException('????????? ???????????? ??????', 400);
        }
    }

    async createCourse(data: CourseCreateDto) {
        const regionText: string = data.location.split(' ')[0];
        let region: number;

        try {
            switch (regionText) {
                case '??????':
                    region = 1;
                    break;
                case '??????':
                    region = 2;
                    break;
                case '??????':
                    region = 3;
                    break;
                case '??????':
                    region = 4;
                    break;
                case '??????':
                case '??????':
                case '?????????????????????':
                    region = 5;
                    break;
                case '??????':
                case '??????':
                    region = 6;
                    break;
                case '??????':
                case '??????':
                case '??????':
                    region = 7;
                    break;
                case '??????':
                case '??????':
                case '??????':
                    region = 8;
                    break;
                case '?????????????????????':
                    region = 9;
                    break;
            }

            data.region = region;
            data.createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
            data.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

            return this.courseRepository.createCourse(data);
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, 400);
        }
    }

    async deleteCourse(courseId: string, userId: string) {
        const course = await this.courseRepository.getCourseByCourseId(
            courseId,
        );

        if (!course)
            throw new HttpException('?????? ???????????? ???????????? ????????????', 400);
        if (course['userId'] !== userId)
            throw new HttpException(
                '????????? ????????? ?????? ????????? ??? ????????????',
                400,
            );

        await this.courseRepository.deleteCourse(courseId);

        for (let i = 1; i <= 3; i++) {
            let url = course[`courseImageUrl${i}`];

            if (url !== null) deleteCourse(url);
        }
        return;
    }

    async bookmark(courseId: string, userId: string) {
        const chkBookmark = await this.courseRepository.getBookmark(
            courseId,
            userId,
        );

        const course = await this.courseRepository.getCourseByCourseId(
            courseId,
        );

        if (course.userId === userId)
            throw new HttpException('?????? ?????? ???????????? ??? ????????????', 400);

        if (!chkBookmark) {
            await this.courseRepository.doBookmark(courseId, userId);
            return true;
        } else {
            await this.courseRepository.cancelBookmark(courseId, userId);
            return false;
        }
    }

    async updateStar(courseId: string, userId: string, point: number) {
        await this.courseRepository.insertStar(courseId, userId, point);
        const starPoint = await this.courseRepository.getStarByCourseId(
            courseId,
        );

        const resultPoint = starPoint.total / starPoint.count;

        await this.courseRepository.updateCoursePoint(courseId, resultPoint);
    }
}
