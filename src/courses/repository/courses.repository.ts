import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmarks } from 'src/models/entities/Bookmarks';
import { Courses } from 'src/models/entities/Courses';
import { Starpoint } from 'src/models/entities/Starpoint';
import { Users } from 'src/models/entities/Users';
import { Repository } from 'typeorm';
import { CourseCreateDto } from '../dto/course.create.dto';

@Injectable()
export class CourseRepository {
    constructor(
        @InjectRepository(Courses) private readonly Course: Repository<Courses>,
        @InjectRepository(Bookmarks)
        private readonly Bookmark: Repository<Bookmarks>,
        @InjectRepository(Starpoint)
        private readonly starPoint: Repository<Starpoint>,
        @InjectRepository(Users) private readonly Users: Repository<Users>,
    ) {}

    getCourse(
        query: { [key: string]: string },
        user: Users,
        category: string,
    ): Promise<object> {
        const data = this.Course.createQueryBuilder()
            .where('1')
            .select([
                'Courses.courseId AS courseId',
                'title',
                'distance',
                'location',
                'region',
                'courseImageUrl1',
                'clickCnt',
                'timestampdiff(second, updatedAt, now()) AS updateTime',
                'starPoint',
                '(select COUNT(*) from Comments where courseId = Courses.courseId) AS commentCnt',
                '(select COUNT(*) from Bookmarks where courseId = Courses.courseId) AS bookmarkCnt',
            ]);

        // 지역필터 0 : 전체 / 1~9 각 지역코드
        if (query.region !== '0' && query.region) {
            data.andWhere('region = :region', { region: query.region });
        } else if (query.region === '0') {
            data.andWhere('region >= 1');
        }
        // 정렬
        switch (query.sort) {
            case 'new':
                data.orderBy('createdAt', 'DESC');
                break;
            case 'startPoint':
                data.orderBy('starPoint', 'DESC');
                break;
            case 'comment':
                data.orderBy('commentCnt', 'DESC');
                break;
            case 'bookmark':
                data.orderBy('bookmarkCnt', 'DESC');
                break;
        }

        // 추천코스와 메인페이지의 경우 3개까지만 추출
        if (category === 'rank' || category === 'main') {
            data.limit(3);
        }

        // 마이페이지의 경우 쿼리에서 userId를 가져옴
        if (category === 'mypage' || category === 'bookmark') {
            if (!query.userId)
                throw new HttpException('유저를 불러오지 못했습니다', 400);
            user.userId = query.userId;

            if (category === 'mypage') {
                data.andWhere('userId = :userId', { userId: user.userId });
            } else if (category === 'bookmark') {
                data.leftJoin('Courses.bookmarks', 'bookmarks');
                data.andWhere('bookmarks.userId = :userId', {
                    userId: user.userId,
                });
            }
        }

        return data.getRawMany().then(async (result) => {
            for (const row of result) {
                //이미지 리사이징 URL로 변경
                if (row.updateTime <= 10) {
                    row.courseImageUrl1 =
                        'https://dpnlaom97ul1b.cloudfront.net/courseImage/' +
                        row.courseImageUrl1;
                } else {
                    row.courseImageUrl1 =
                        'https://dpnlaom97ul1b.cloudfront.net/w_384/' +
                        row.courseImageUrl1;
                }

                //북마크 상태값
                if (user) {
                    const bookmark = await this.Bookmark.createQueryBuilder()
                        .where('courseId = :courseId', {
                            courseId: row.courseId,
                        })
                        .andWhere('userId = :userId', { userId: user.userId })
                        .getOne();

                    if (bookmark) row.bookmark = true;
                    else row.bookmark = false;
                } else row.bookmark = false;

                //주소 양식변경
                const location = row.location.split(' ');
                row.location = location[0] + ' ' + location[1];
            }
            return result;
        });
    }

    getDetailCourse(courseId: string, user: Users) {
        try {
            const data = this.Course.createQueryBuilder()
                .select([
                    'courseId',
                    'content',
                    'title',
                    'courseImageUrl1',
                    'courseImageUrl2',
                    'courseImageUrl3',
                    'distance',
                    'location',
                    'parking',
                    'baggage',
                    'thema',
                    'clickCnt',
                    'mapLatLng',
                    'userId',
                ])
                .where('courseId = :courseId', { courseId });

            return data.getRawOne().then(async (result) => {
                result.mapLatLng = JSON.parse(result.mapLatLng);

                result.user = await this.Users.createQueryBuilder()
                    .select([
                        'nickname',
                        'profileUrl',
                        'userId',
                        'userLevel',
                        'mannerPoint',
                    ])
                    .where('userId = :userId', { userId: result.userId })
                    .getRawOne();

                for (let i = 1; i <= 3; i++) {
                    if (result[`courseImageUrl${i}`] !== null)
                        result[`courseImageUrl${i}`] =
                            'https://dpnlaom97ul1b.cloudfront.net/w_758/' +
                            result[`courseImageUrl${i}`];
                }

                if (result.courseImageUrl1 === null) {
                    switch (result.thema) {
                        case '산':
                            result.courseImageUrl1 =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%EB%B3%B8%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%89%E1%85%A1%E1%86%AB.png';
                            break;
                        case '도시':
                            result.courseImageUrl1 =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%83%E1%85%A9%E1%84%89%E1%85%B5.png';
                            break;
                        case '강변':
                            result.courseImageUrl1 =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A1%E1%86%BC%E1%84%87%E1%85%A7%E1%86%AB.png';
                            break;
                        case '해변':
                            result.courseImageUrl1 =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%92%E1%85%A2%E1%84%87%E1%85%A7%E1%86%AB.png';
                            break;
                        case '공원':
                            result.courseImageUrl1 =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%AF%E1%86%AB.png';
                            break;
                        case '트랙':
                            result.courseImageUrl1 =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%90%E1%85%B3%E1%84%85%E1%85%A2%E1%86%A8.png';
                            break;
                    }
                }

                return result;
            });
        } catch (error) {
            console.log(error);
            throw new HttpException('게시글 불러오기를 실패하였습니다', 400);
        }
    }

    getMyStar(courseId: string, userId: string) {
        try {
            return this.starPoint
                .createQueryBuilder()
                .select(['myStarPoint'])
                .where('courseId = :courseId AND userId = :userId', {
                    courseId,
                    userId,
                })
                .getRawOne();
        } catch (error) {
            console.log(error);
            throw new HttpException('평점 불러오기를 실패하였습니다', 400);
        }
    }

    getStarNumByCourseId(courseId: string) {
        return this.starPoint
            .createQueryBuilder()
            .where('courseId = :courseId', { courseId })
            .getCount();
    }

    getStarByCourseId(courseId: string) {
        return this.starPoint
            .createQueryBuilder()
            .where('courseId = :courseId', { courseId })
            .getMany()
            .then((result) => {
                let total: number = 0;
                for (let i = 0; i < result.length; i++) {
                    console.log(result[i].myStarPoint);
                    total += result[i].myStarPoint;
                }
                return {
                    total,
                    count: result.length,
                };
            });
    }

    getCourseByCourseId(courseId: string) {
        return this.Course.createQueryBuilder()
            .where('courseId = :courseId', { courseId })
            .getOne();
    }

    createCourse(data: CourseCreateDto) {
        this.Course.createQueryBuilder()
            .insert()
            .into(Courses)
            .values({ ...data })
            .execute();
    }

    deleteCourse(courseId: string) {
        return this.Course.createQueryBuilder()
            .delete()
            .from(Courses)
            .where('courseId = :courseId', { courseId })
            .execute();
    }

    getBookmark(courseId: string, userId: string) {
        return this.Bookmark.createQueryBuilder()
            .where('courseId = :courseId', { courseId })
            .andWhere('userId = :userId', { userId })
            .getOne();
    }

    doBookmark(courseId: string, userId: string) {
        return this.Bookmark.createQueryBuilder()
            .insert()
            .into(Bookmarks)
            .values({ courseId, userId })
            .execute();
    }

    cancelBookmark(courseId: string, userId: string) {
        return this.Bookmark.createQueryBuilder()
            .delete()
            .from(Bookmarks)
            .where('courseId = :courseId', { courseId })
            .andWhere('userid = :userId', { userId })
            .execute();
    }

    async insertStar(courseId: string, userId: string, point: number) {
        const exist = await this.starPoint
            .createQueryBuilder()
            .where('courseId = :courseId', { courseId })
            .andWhere('userId = :userId', { userId })
            .getOne();

        if (exist) {
            await this.starPoint
                .createQueryBuilder()
                .update(Starpoint)
                .set({ courseId, userId, myStarPoint: point })
                .where('courseId=:courseId', { courseId })
                .andWhere('userId=:userId', { userId })
                .execute();
        } else {
            await this.starPoint
                .createQueryBuilder()
                .insert()
                .into(Starpoint)
                .values({ courseId, userId, myStarPoint: point })
                .execute();
        }
        return;
    }

    async updateCoursePoint(courseId: string, point: number) {
        return this.Course.createQueryBuilder()
            .update(Courses)
            .set({ starPoint: point })
            .where('courseId = :courseId', { courseId })
            .execute();
    }
}
