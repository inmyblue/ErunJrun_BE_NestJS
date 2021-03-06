import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import { Groups } from '../../models/entities/Groups';
import { Users } from '../../models/entities/Users';
import { Appliers } from '../../models/entities/Appliers';
import { GroupCreateDto } from '../dto/group.create.dto';
import { condition } from '../interfaces/condition.interface';
import { GroupUpdateDto } from '../dto/group.update.dto';
import { Alarms } from 'src/models/entities/Alarms';

@Injectable()
export class GroupRepository {
    constructor(
        @InjectRepository(Groups) private readonly Group: Repository<Groups>,
        @InjectRepository(Users) private readonly User: Repository<Users>,
        @InjectRepository(Appliers)
        private readonly Appliers: Repository<Appliers>,
        @InjectRepository(Alarms) private readonly Alarms: Repository<Alarms>,
    ) {}
    async createPost(data: GroupCreateDto) {
        await this.Group.createQueryBuilder()
            .insert()
            .into(Groups)
            .values({ ...data })
            .execute();
        return;
    }

    async getGroup(condition: condition, myUserId: string) {
        let data = this.Group.createQueryBuilder('group')
            .select([
                'title',
                'location',
                'distance',
                'group.groupId AS groupId',
                'date',
                'standbyTime',
                'thema',
                'group.userId AS userId',
                'maxPeople',
                'thumbnailUrl1 AS thumbnailUrl',
                '(select COUNT(*) from Appliers where groupId=group.groupId) AS applyPeople',
                'datediff(date,now()) AS applyEndTime',
                'timestampdiff(second, updatedAt, now()) AS updateTime',
            ])
            .where('1')
            .orderBy('applyEndTime');

        if (condition.region) {
            data.andWhere('region in (:region)', {
                region: condition.region,
            });
        }

        if (condition.startDate && condition.endDate) {
            data.andWhere('date >= :startDate AND date <= :endDate', {
                startDate: condition.startDate,
                endDate: condition.endDate,
            });
        }

        if (condition.timecode) {
            data.andWhere('timecode in (:timecode)', {
                timecode: condition.timecode,
            });
        }

        if (!condition.finish) {
            data.andWhere(
                '(date > :nowDate OR (date = :nowDate AND standbyTime > :nowTime))',
                {
                    nowDate: dayjs().format('YYYY-MM-DD'),
                    nowTime: dayjs().format('HH:mm:ss'),
                },
            );
        }

        if (condition.complete) {
            data.leftJoin('group.appliers', 'appliers');
            data.andWhere('appliers.userId = :userId', { userId: myUserId });
            data.andWhere('date < :nowDate', {
                nowDate: dayjs().format('YYYY-MM-DD'),
            });
        }

        if (condition.thema) {
            data.andWhere('thema in (:thema)', { thema: condition.thema });
        }

        if (
            condition.distanceMin !== null &&
            condition.distanceMin !== undefined
        ) {
            if (condition.distanceMin !== -1 && condition.distanceMin !== 15) {
                data.andWhere(
                    'distance BETWEEN :distanceMin AND :distanceMax',
                    {
                        distanceMin: condition.distanceMin,
                        distanceMax: condition.distanceMax,
                    },
                );
            } else if (condition.distanceMin === -1) {
                data.andWhere('distance >= 0');
            } else if (condition.distanceMin === 15) {
                data.andWhere('distance >= 15');
            }
        }

        if (condition.limit) {
            data.limit(condition.limit);
        }

        if (condition.userId) {
            data.andWhere('userId = :userId', { userId: condition.userId });
        }

        if (condition.page && condition.size) {
            data.take(condition.size);
            data.skip((condition.page - 1) * condition.size);
        }

        return data.getRawMany().then(async (result) => {
            for (const row of result) {
                //???????????? ???????????? ?????????/?????????????????? ??????
                const userData = await this.getUser(row.userId);
                row.nickname = userData.nickname;
                row.profileUrl = userData.profileUrl;

                //???????????? ????????? ??? ??????????????? ????????? ???????????? ??????
                const chkApply = await this.chkApply(myUserId, row.groupId);
                if (chkApply) row.applyState = true;
                else row.applyState = false;

                //??????????????? ??????????????? ?????? ???????????????/???????????? ???????????? ??????
                if (condition.complete === true) {
                    if (row.userId === myUserId) {
                        row.evaluation =
                            chkApply.evaluation === 0 ? false : true;
                    } else {
                        row.attendance =
                            chkApply.attendance === 0 ? false : true;
                    }
                }

                //???????????? ??????+??????
                const nowDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
                const dateTime =
                    dayjs(row.date).format('YYYY-MM-DD') +
                    ' ' +
                    row.standbyTime;

                row.date = dayjs(dateTime).format('YYYY.MM.DD (dd) HH:mm');

                //?????????????????? ????????? ???????????? ??????
                if (parseInt(row.applyEndTime) === 0) {
                    let diffTime = dayjs(nowDateTime).diff(dateTime, 'h');
                    row.applyEndTime = Math.abs(diffTime) + ' ??????';
                } else if (parseInt(row.applyEndTime) > 0) {
                    row.applyEndTime += ' ???';
                } else {
                    row.applyEndTime = '0 ???';
                }

                //??????????????? ?????????????????? ????????????
                let location: string[] = row.location.split(' ');
                row.location = location[0] + ' ' + location[1];

                if (row.thumbnailUrl === null) {
                    switch (row.thema) {
                        case '???':
                            row.thumbnailUrl =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%EB%B3%B8%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%89%E1%85%A1%E1%86%AB.png';
                            break;
                        case '??????':
                            row.thumbnailUrl =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%83%E1%85%A9%E1%84%89%E1%85%B5.png';
                            break;
                        case '??????':
                            row.thumbnailUrl =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A1%E1%86%BC%E1%84%87%E1%85%A7%E1%86%AB.png';
                            break;
                        case '??????':
                            row.thumbnailUrl =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%92%E1%85%A2%E1%84%87%E1%85%A7%E1%86%AB.png';
                            break;
                        case '??????':
                            row.thumbnailUrl =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%AF%E1%86%AB.png';
                            break;
                        case '??????':
                            row.thumbnailUrl =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%90%E1%85%B3%E1%84%85%E1%85%A2%E1%86%A8.png';
                            break;
                    }
                } else {
                    if (row.updateTime <= 10) {
                        row.thumbnailUrl =
                            'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/' +
                            row.thumbnailUrl;
                    } else {
                        row.thumbnailUrl =
                            'https://dpnlaom97ul1b.cloudfront.net/w_384/' +
                            row.thumbnailUrl;
                    }
                }
            }
            return result;
        });
    }

    async getUser(myUserId: string): Promise<Users> {
        return await this.User.findOne({ userId: myUserId });
    }

    async chkApply(myUserId: string, groupId: string): Promise<Appliers> {
        const data = await this.Appliers.findOne({
            where: {
                userId: myUserId,
                groupId,
            },
        });

        return data;
    }

    async getGroupbyId(groupId: string): Promise<Groups> {
        return await this.Group.findOne({
            where: {
                groupId,
            },
        });
    }

    async updatePost(groupId: string, data: GroupUpdateDto) {
        await this.Group.createQueryBuilder()
            .update(Groups)
            .set({ ...data })
            .where('groupId = :groupId', { groupId })
            .execute();
        return;
    }

    async deletePost(groupId: string) {
        await this.Group.createQueryBuilder()
            .delete()
            .from(Groups)
            .where('groupId = :groupId', { groupId })
            .execute();
        return;
    }

    async getGroupDetail(groupId: string, userId: string): Promise<object> {
        const data = this.Group.createQueryBuilder('group')
            .select([
                'mapLatLng',
                'title',
                'userId',
                'maxPeople',
                'thumbnailUrl1',
                'thumbnailUrl2',
                'thumbnailUrl3',
                'date',
                'standbyTime',
                'distance',
                'speed',
                'location',
                'parking',
                'baggage',
                'content',
                'thema',
                'chattingRoom',
                '(select COUNT(*) from Appliers where groupId=group.groupId) AS applyPeople',
                'createdAt',
                'datediff(date,now()) AS applyEndTime',
            ])
            .where('group.groupId = :groupId', { groupId });

        return data.getRawOne().then(async (result) => {
            // ?????? ??????????????? ???????????? ??????
            const chkApply = await this.chkApply(userId, groupId);
            if (chkApply) result.applyState = true;
            else result.applyState = false;

            // ???????????? ???????????? ?????? ?????? ??????
            const getUser = await this.getUser(result.userId);
            result.nickname = getUser.nickname;
            result.profileUrl = getUser.profileUrl;
            result.userLevel = getUser.userLevel;

            // ??????????????? ??????+??????
            const nowDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
            const dateTime =
                dayjs(result.date).format('YYYY-MM-DD') +
                ' ' +
                result.standbyTime;
            result.datetime = dateTime;

            result.createdAt = dayjs(result.createdAt).format(
                'YYYY-MM-DD HH:mm:ss',
            );

            // ??????????????? ???????????? ?????? ??????
            if (parseInt(result.applyEndTime) === 0) {
                let diffTime = dayjs(nowDateTime).diff(dateTime, 'h');
                result.applyEndTime = Math.abs(diffTime) + ' ??????';
            } else if (parseInt(result.applyEndTime) > 0) {
                result.applyEndTime += ' ???';
            } else {
                result.applyEndTime = '0 ???';
            }

            // ???????????? ??????,???????????? ?????? parser
            result.mapLatLng = JSON.parse(result.mapLatLng);

            // ???????????? ????????? ??????
            result.Appliers = await this.User.createQueryBuilder('user')
                .select(['user.nickname', 'user.profileUrl', 'user.userId'])
                .leftJoin('user.appliers', 'appliers')
                .where('appliers.groupId = :groupId', { groupId })
                .getMany();

            // ????????? ????????? ???????????? ??? URL??? ??????
            for (let i = 1; i <= 3; i++) {
                if (result[`thumbnailUrl${i}`] !== null)
                    result[`thumbnailUrl${i}`] =
                        'https://dpnlaom97ul1b.cloudfront.net/w_758/' +
                        result[`thumbnailUrl${i}`];
            }

            if (result.thumbnailUrl1 === null) {
                switch (result.thema) {
                    case '???':
                        result.thumbnailUrl1 =
                            'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%EB%B3%B8%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%89%E1%85%A1%E1%86%AB.png';
                        break;
                    case '??????':
                        result.thumbnailUrl1 =
                            'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%83%E1%85%A9%E1%84%89%E1%85%B5.png';
                        break;
                    case '??????':
                        result.thumbnailUrl1 =
                            'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A1%E1%86%BC%E1%84%87%E1%85%A7%E1%86%AB.png';
                        break;
                    case '??????':
                        result.thumbnailUrl1 =
                            'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%92%E1%85%A2%E1%84%87%E1%85%A7%E1%86%AB.png';
                        break;
                    case '??????':
                        result.thumbnailUrl1 =
                            'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%AF%E1%86%AB.png';
                        break;
                    case '??????':
                        result.thumbnailUrl1 =
                            'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%90%E1%85%B3%E1%84%85%E1%85%A2%E1%86%A8.png';
                        break;
                }
            }

            return result;
        });
    }

    chkApplyById(groupId: string, userId: string) {
        return this.Appliers.findOne({ where: { groupId, userId } });
    }

    cancelApply(groupId: string, userId: string) {
        return this.Appliers.createQueryBuilder()
            .delete()
            .from(Appliers)
            .where('groupId = :groupId AND userId = :userId', {
                groupId,
                userId,
            })
            .execute();
    }

    getApplyCount(groupId: string) {
        return this.Appliers.createQueryBuilder()
            .where('groupId = :groupId', { groupId })
            .getCount();
    }

    getApplyByGroupId(groupId: string) {
        return this.Appliers.createQueryBuilder()
            .where('groupId = :groupId', { groupId })
            .getMany();
    }

    createApply(groupId: string, userId: string) {
        return this.Appliers.createQueryBuilder()
            .insert()
            .values({ groupId, userId })
            .execute();
    }

    getApplyGroupByUserId(userId: string) {
        return this.Group.createQueryBuilder('groups')
            .select([
                'date',
                'title',
                'location',
                'distance',
                'groups.groupId AS groupId',
                'thumbnailUrl1 AS thumbnailUrl',
                'standbyTime',
                'thema',
                '(select COUNT(*) from Users where userId=groups.userId) AS applyPeople',
                'datediff(date,now()) AS dDay',
            ])
            .leftJoin('groups.appliers', 'appliers')
            .where('appliers.userId = :userId', { userId })
            .andWhere('date >= now()')
            .getRawMany()
            .then((result) => {
                for (const row of result) {
                    row.date =
                        dayjs(row.date).format('YYYY.MM.DD (dd)') +
                        ' ' +
                        row.standbyTime;

                    row.dDay = Math.abs(row.dDay);
                    row.distance = row.distance + 'km';

                    if (row.thumbnailUrl === null) {
                        switch (row.thema) {
                            case '???':
                                row.thumbnailUrl =
                                    'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%EB%B3%B8%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%89%E1%85%A1%E1%86%AB.png';
                                break;
                            case '??????':
                                row.thumbnailUrl =
                                    'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%83%E1%85%A9%E1%84%89%E1%85%B5.png';
                                break;
                            case '??????':
                                row.thumbnailUrl =
                                    'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A1%E1%86%BC%E1%84%87%E1%85%A7%E1%86%AB.png';
                                break;
                            case '??????':
                                row.thumbnailUrl =
                                    'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%92%E1%85%A2%E1%84%87%E1%85%A7%E1%86%AB.png';
                                break;
                            case '??????':
                                row.thumbnailUrl =
                                    'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%80%E1%85%A9%E1%86%BC%E1%84%8B%E1%85%AF%E1%86%AB.png';
                                break;
                            case '??????':
                                row.thumbnailUrl =
                                    'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/%E1%84%80%E1%85%B5%E1%84%87%E1%85%A9%E1%86%AB%EC%8D%B8%EB%84%A4%EC%9D%BC_%E1%84%90%E1%85%B3%E1%84%85%E1%85%A2%E1%86%A8.png';
                                break;
                        }
                    } else {
                        if (row.updateTime <= 10) {
                            row.thumbnailUrl =
                                'https://dpnlaom97ul1b.cloudfront.net/groupthumbnail/' +
                                row.thumbnailUrl;
                        } else {
                            row.thumbnailUrl =
                                'https://dpnlaom97ul1b.cloudfront.net/w_384/' +
                                row.thumbnailUrl;
                        }
                    }
                }
                return result;
            });
    }

    getUserProfile(userId: string) {
        return this.User.createQueryBuilder()
            .select(['userId', 'nickname', 'profileUrl'])
            .where('userId = :userId', { userId })
            .getRawOne();
    }

    getAttendance(groupId: string): object {
        return this.Group.createQueryBuilder()
            .select(['date', 'standbyTime', 'maxPeople', 'title', 'userId'])
            .where('groupId = :groupId', { groupId })
            .getRawOne()
            .then(async (result) => {
                result.date =
                    dayjs(result.date).format('YYYY.MM.DD (dd)') +
                    ' ' +
                    result.standbyTime;
                result.attendanceCount =
                    (await this.getApplyCount(groupId)) +
                    '/' +
                    result.maxPeople;

                result.user = await this.getUserProfile(result.userId);

                delete result.standbyTime;
                return result;
            });
    }

    async getApplyUserByGroupId(groupId: string): Promise<object> {
        const result = await this.Appliers.createQueryBuilder()
            .where('groupId = :groupId', { groupId })
            .getMany()
            .then(async (result) => {
                for (const row of result) {
                    row.user = await this.getUserProfile(row.userId);
                }

                return result;
            });

        return result;
    }

    addAlarm(
        groupId: string,
        groupTitle: string,
        category: string,
        userId: string,
    ) {
        return this.Alarms.createQueryBuilder()
            .insert()
            .values({ groupId, groupTitle, category, userId })
            .execute();
    }

    addDdayAlarm(input: { [key: string]: string }) {
        const { groupId, groupTitle, category, userId, role, nickname } = input;
        return this.Alarms.createQueryBuilder()
            .insert()
            .values({
                groupId,
                groupTitle,
                category,
                userId,
                role,
                nickname,
                createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            })
            .execute();
    }
}
