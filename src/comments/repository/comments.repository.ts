import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Comments } from 'src/models/entities/Comments';
import { Recomments } from 'src/models/entities/Recomments';
import { Users } from 'src/models/entities/Users';
import { Repository } from 'typeorm';

@Injectable()
export class CommentRepository {
    constructor(
        @InjectRepository(Comments)
        private readonly Comments: Repository<Comments>,
        @InjectRepository(Recomments)
        private readonly Recomments: Repository<Recomments>,
        @InjectRepository(Users)
        private readonly Users: Repository<Users>,
    ) {}

    async getComments(category: string, categoryId: string): Promise<object> {
        let data = this.Comments.createQueryBuilder().where('1');

        switch (category) {
            case 'group':
                data.andWhere('groupId = :categoryId', { categoryId });
                break;
            case 'course':
                data.andWhere('courseId = :categoryId', { categoryId });
                break;
            default:
                throw new HttpException('카테고리값이 올바르지 않습니다', 400);
        }

        return data.getMany().then(async (result) => {
            for (let i = 0; i < result.length; i++) {
                result[i].createdAt = this.timeForToday(result[i].createdAt);

                result[i].user = await this.Users.findOne({
                    select: ['userId', 'userLevel', 'nickname', 'profileUrl'],
                    where: { userId: result[i].userId },
                });
            }
            return result;
        });
    }

    async postComment(input: { [key: string]: string }): Promise<object> {
        let data = this.Comments.createQueryBuilder().insert();

        const { categoryId, content, userId, category } = input;

        switch (category) {
            case 'group':
                data.values({
                    groupId: categoryId,
                    content,
                    userId,
                    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                });
                break;
            case 'course':
                data.values({
                    courseId: categoryId,
                    content,
                    userId,
                    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                });
                break;
            default:
                throw new HttpException('카테고리값이 올바르지 않습니다', 400);
        }

        const result = await data
            .execute()
            .then(async (result): Promise<object> => {
                let data = await this.Comments.createQueryBuilder('comments')
                    .where('comments.groupId = :groupId', {
                        groupId: input.categoryId,
                    })
                    .getMany()
                    .then(async (result) => {
                        for (let i = 0; i < result.length; i++) {
                            result[i].user = await this.Users.findOne({
                                select: [
                                    'userId',
                                    'userLevel',
                                    'nickname',
                                    'profileUrl',
                                ],
                                where: { userId: result[i].userId },
                            });
                            result[i].createdAt = this.timeForToday(
                                result[i].createdAt,
                            );
                        }
                        return result;
                    });
                return data;
            });

        return result;
    }

    updateComment(commentId: string, userId: string, content: string) {
        return this.Comments.createQueryBuilder()
            .update(Comments)
            .set({ content })
            .where('commentId = :commentId AND userId = :userId', {
                commentId,
                userId,
            })
            .execute();
    }

    deleteComment(commentId: string, userId: string) {
        return this.Comments.createQueryBuilder()
            .delete()
            .where('commentId = :commentId AND userId = :userId', {
                commentId,
                userId,
            })
            .execute();
    }

    chkCommentExist(commentId: string) {
        return this.Comments.findOne({ where: { commentId } });
    }

    chkRecommentExist(recommentId: string) {
        return this.Recomments.findOne({ where: { recommentId } });
    }

    timeForToday(createdAt: string | Date) {
        const today = new Date();
        const timeValue = new Date(createdAt);

        const betweenTime = Math.floor(
            (today.getTime() - timeValue.getTime()) / 1000 / 60,
        ); // 분
        if (betweenTime < 1) return '방금 전'; // 1분 미만이면 방금 전
        if (betweenTime < 60) return `${betweenTime}분 전`; // 60분 미만이면 n분 전

        const betweenTimeHour = Math.floor(betweenTime / 60); // 시
        if (betweenTimeHour < 24) return `${betweenTimeHour}시간 전`; // 24시간 미만이면 n시간 전

        const betweenTimeDay = Math.floor(betweenTime / 60 / 24); // 일
        if (betweenTimeDay < 7) return `${betweenTimeDay}일 전`; // 7일 미만이면 n일 전
        if (betweenTimeDay < 365)
            return `${timeValue.getMonth() + 1}월 ${timeValue.getDate()}일`; // 365일 미만이면 년을 제외하고 월 일만

        return `${timeValue.getFullYear()}년 ${
            timeValue.getMonth() + 1
        }월 ${timeValue.getDate()}일`; // 365일 이상이면 년 월 일
    }

    getRecomment(commentId: string): object {
        return this.Recomments.createQueryBuilder()
            .where('commentId = :commentId', { commentId })
            .getMany()
            .then(async (result) => {
                for (let i = 0; i < result.length; i++) {
                    result[i].createdAt = this.timeForToday(
                        result[i].createdAt,
                    );

                    result[i].user = await this.Users.findOne({
                        select: [
                            'userId',
                            'userLevel',
                            'nickname',
                            'profileUrl',
                        ],
                        where: { userId: result[i].userId },
                    });
                }

                return result;
            });
    }

    postRecomment(commentId: string, content: string, userId: string) {
        return this.Recomments.createQueryBuilder()
            .insert()
            .values({
                content,
                commentId,
                userId,
                createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            .execute();
    }
    updateRecomment(recommentId: string, content: string, userId: string) {
        return this.Recomments.createQueryBuilder()
            .update(Recomments)
            .set({ content })
            .where('recommentId = :recommentId AND userId = :userId', {
                recommentId,
                userId,
            })
            .execute();
    }
}
