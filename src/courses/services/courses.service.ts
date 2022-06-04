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
            throw new HttpException('게시글 불러오기를 실패하였습니다', 400);
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

            const starPeople = await this.courseRepository.getStarByCourseId(
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
            throw new HttpException('게시물 불러오기 실패', 400);
        }
    }

    async createCourse(data: CourseCreateDto) {
        const regionText: string = data.location.split(' ')[0];
        let region: number;

        try {
            switch (regionText) {
                case '서울':
                    region = 1;
                    break;
                case '경기':
                    region = 2;
                    break;
                case '인천':
                    region = 3;
                    break;
                case '강원':
                    region = 4;
                    break;
                case '충남':
                case '충북':
                case '세종특별자치시':
                    region = 5;
                    break;
                case '경북':
                case '대구':
                    region = 6;
                    break;
                case '경남':
                case '부산':
                case '울산':
                    region = 7;
                    break;
                case '전남':
                case '전북':
                case '광주':
                    region = 8;
                    break;
                case '제주특별자치도':
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
            throw new HttpException('해당 게시물이 존재하지 않습니다', 400);
        if (course['userId'] !== userId)
            throw new HttpException(
                '본인이 작성한 글만 삭제할 수 있습니다',
                400,
            );

        await this.courseRepository.deleteCourse(courseId);

        for (let i = 1; i <= 3; i++) {
            let url = course[`courseImageUrl${i}`];

            if (url !== null) deleteCourse(url);
        }
        return;
    }
}
