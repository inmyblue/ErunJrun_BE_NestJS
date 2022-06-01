import { GroupRepository } from '../repository/groups.repository';
import { HttpException, Injectable } from '@nestjs/common';
import { GroupCreateDto } from '../dto/group.create.dto';
import { Users } from 'src/models/entities/Users';
import { condition } from '../interfaces/condition.interface';
import { deleteImg } from '../../common/middlewares/multer';
import * as dayjs from 'dayjs';
import { Groups } from 'src/models/entities/Groups';
import { GroupUpdateDto } from '../dto/group.update.dto';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class GroupsService {
    constructor(
        private readonly groupRepository: GroupRepository,
        private schedulerRegistry: SchedulerRegistry,
    ) {}
    async createPost(data: GroupCreateDto): Promise<object> {
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

            let nowDate = dayjs().format('YYYY-MM-DD');
            if (data.date <= nowDate) {
                throw new HttpException(
                    '현재 날짜보다 이전의 그룹러닝은 등록할 수 없습니다',
                    400,
                );
            }

            let timeCode: number = parseInt(data.standbyTime.split(':')[0]);
            timeCode = Math.ceil(timeCode / 4);

            data.region = region;
            data.timecode = timeCode;

            await this.groupRepository.createPost(data);
            return;
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, 400);
        }
    }

    async getGroup(category: string, query, myUserId: string): Promise<object> {
        let condition: condition = {};

        try {
            switch (category) {
                case 'mypage':
                    Object.assign(condition, { userId: myUserId });
                    return this.groupRepository.getGroup(condition, myUserId);
                case 'main':
                    Object.assign(condition, { limit: 6 });
                    return this.groupRepository.getGroup(condition, myUserId);
                case 'complete':
                    Object.assign(condition, { complete: true, finish: true });
                    return this.groupRepository.getGroup(condition, myUserId);
                case 'prefer':
                    const user: Users = await this.groupRepository.getUser(
                        myUserId,
                    );

                    if (parseInt(user.likeDistance) === 0) {
                        Object.assign(condition, {
                            distanceMix: 0,
                            distanceMax: 100,
                        });
                    } else {
                        Object.assign(condition, {
                            distanceMin: parseInt(user.likeDistance) * 5 - 5,
                            distanceMax: parseInt(user.likeDistance) * 5,
                        });
                    }

                    Object.assign(condition, { region: user.likeLocation });

                    if (query.finish === '1') {
                        condition = Object.assign(condition, { finish: 1 });
                    }

                    let data = await this.groupRepository.getGroup(
                        condition,
                        myUserId,
                    );

                    let likeDistance: string, likeLocation: string;

                    switch (user.likeDistance) {
                        case '1':
                            likeDistance = '5km 미만';
                            break;
                        case '2':
                            likeDistance = '5km 이상 10km 미만';
                            break;
                        case '3':
                            likeDistance = '10km 이상 15km 미만';
                            break;
                        case '4':
                            likeDistance = '15km 이상';
                            break;
                        default:
                            likeDistance = '미정';
                            break;
                    }

                    switch (user.likeLocation) {
                        case '1':
                            likeLocation = '서울';
                            break;
                        case '2':
                            likeLocation = '경기도';
                            break;
                        case '3':
                            likeLocation = '인천광역시';
                            break;
                        case '4':
                            likeLocation = '강원도';
                            break;
                        case '5':
                            likeLocation = '충청도/세종특별시/대전광역시';
                            break;
                        case '6':
                            likeLocation = '경상북도/대구광역시';
                            break;
                        case '7':
                            likeLocation = '경상남도/부산광역시/울산광역시';
                            break;
                        case '8':
                            likeLocation = '전라남도/전라북도/광주광역시';
                            break;
                        case '9':
                            likeLocation = '제주특별시';
                            break;
                        default:
                            likeLocation = '미정';
                            break;
                    }

                    return {
                        data,
                        preferData: {
                            likeDistance,
                            likeLocation,
                        },
                    };
                case 'all':
                    if (query.date) {
                        let startDate: Date = query.date.split('/')[0];
                        let endDate: Date = query.date.split('/')[1];

                        Object.assign(condition, {
                            startDate: startDate,
                            endDate: endDate,
                        });
                    }

                    if (query.time) {
                        const timeQuery = query.time.split('/');
                        Object.assign(condition, { timecode: timeQuery });
                    }

                    if (query.finish === '1') {
                        condition = Object.assign(condition, { finish: 1 });
                    }

                    if (query.thema) {
                        let themaQuery = decodeURIComponent(query.thema).split(
                            '/',
                        );
                        Object.assign(condition, { thema: themaQuery });
                    }

                    if (query.region) {
                        let regionQuery = query.region.split('/');
                        if (regionQuery.includes('0')) {
                            regionQuery = [];
                            for (let i = 1; i <= 9; i++) {
                                regionQuery.push(i);
                            }
                        }
                        Object.assign(condition, { region: regionQuery });
                    }

                    if (query.distance) {
                        const distanceQuery = query.distance.split('/');
                        if (distanceQuery.includes('0')) {
                            Object.assign(condition, { distanceMin: 0 });
                        } else {
                            Object.assign(condition, {
                                distanceMin: Math.min(...distanceQuery) * 5 - 5,
                                distanceMax: Math.max(...distanceQuery) * 5,
                            });
                        }
                    }
                    return await this.groupRepository.getGroup(
                        condition,
                        myUserId,
                    );
            }
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, 400);
        }
    }

    async updatePost(groupId: string, userId: string, data: GroupUpdateDto) {
        const group: Groups = await this.groupRepository.getGroupbyId(groupId);
        const nowDate = dayjs().format('YYYY-MM-DD HH:mm:ss');

        try {
            if (!group) {
                throw new HttpException('해당 게시물이 존재하지 않습니다', 400);
            }

            if (group.userId !== userId) {
                throw new HttpException(
                    '본인이 작성한 글만 수정할 수 있습니다',
                    400,
                );
            }

            if (nowDate > `${group.date} ${group.standbyTime}`) {
                throw new HttpException(
                    '이미 지난 그룹러닝은 수정할 수 없습니다',
                    400,
                );
            }

            if (data.thumbnailUrl) {
                let thumbnail: string[] = [];

                if (typeof data.thumbnailUrl === 'string') {
                    thumbnail.push(data.thumbnailUrl);
                } else {
                    thumbnail = data.thumbnailUrl;
                }

                // 기존 이미지는 앞에부터 차례대로 넣어주기
                for (let i = 0; i < thumbnail.length; i++) {
                    data[`thumbnailUrl${i + 1}`] = thumbnail[i];
                }

                for (let i = 0; i < 3 - thumbnail.length; i++) {
                    let rowNum = thumbnail.length + i + 1;
                    if (data.files[i]) {
                        data[`thumbnailUrl${rowNum}`] =
                            data.files[i]['location'];
                    } else {
                        data[`thumbnailUrl${rowNum}`] = null;
                        if (group[`thumbnailUrl${rowNum}`] !== null) {
                            deleteImg(group[`thumbnailUrl${rowNum}`]);
                        }
                    }
                }
            }

            delete data.thumbnailUrl;
            delete data.files;

            await this.groupRepository.updatePost(groupId, data);

            const alarmUser = await this.groupRepository.getApplyByGroupId(
                groupId,
            );

            for (let i = 0; i < alarmUser.length; i++) {
                this.groupRepository.addAlarm(
                    groupId,
                    group.title,
                    'update',
                    alarmUser[i].userId,
                );
            }
            return;
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, 400);
        }
    }

    async deletePost(groupId: string, userId: string) {
        const group = await this.groupRepository.getGroupbyId(groupId);

        try {
            if (!group) {
                throw new HttpException('해당 게시물이 존재하지 않습니다', 400);
            }

            if (group['userId'] !== userId) {
                throw new HttpException(
                    '본인이 작성한 글만 삭제할 수 있습니다',
                    400,
                );
            }
            await this.groupRepository.deletePost(groupId);
            for (let i = 1; i <= 3; i++) {
                let url = group[`thumbnailUrl${i}`];

                if (url !== null) deleteImg(url);
            }
            return;
        } catch (error) {
            console.log(Error);
            throw new HttpException(error.message, 400);
        }
    }

    async getGroupDetail(groupId: string, userId: string) {
        try {
            const chkGroup = await this.groupRepository.getGroupbyId(groupId);

            if (!chkGroup) {
                throw new HttpException('해당 게시물이 존재하지 않습니다', 400);
            }

            return await this.groupRepository.getGroupDetail(groupId, userId);
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, 400);
        }
    }

    async applyGroup(groupId: string, userId: string, nickname: string) {
        try {
            const chkApply = await this.groupRepository.chkApplyById(
                groupId,
                userId,
            );
            const chkGroup = await this.groupRepository.getGroupbyId(groupId);

            const startDateTime = chkGroup.date + ' ' + chkGroup.standbyTime;
            const nowDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

            if (startDateTime <= nowDateTime)
                throw new HttpException(
                    '이미 지난 그룹러닝은 신청 및 취소가 불가합니다',
                    400,
                );

            // 이미 신청된게 있으면 취소 로직실행
            if (chkApply) {
                if (chkGroup.userId === userId)
                    throw new HttpException(
                        '개설자는 신청을 취소할 수 없습니다',
                        400,
                    );

                await this.groupRepository.cancelApply(groupId, userId);
                const applyPeople = await this.groupRepository.getApplyCount(
                    groupId,
                );

                this.schedulerRegistry.deleteCronJob(`dDay-${userId}`);
                return { applyPeople, applyState: false };
            } else {
                let applyPeople = await this.groupRepository.getApplyCount(
                    groupId,
                );
                if (chkGroup.maxPeople <= applyPeople) {
                    throw new HttpException(
                        '신청인원이 남아있지 않습니다',
                        400,
                    );
                }

                await this.groupRepository.createApply(groupId, userId);
                applyPeople++;

                const groupDateTime =
                    dayjs(chkGroup.date).format('YYYY-MM-DD') +
                    ' ' +
                    chkGroup.standbyTime;
                let minusDateTime = dayjs(groupDateTime).add(-30, 'minutes');
                const date = new Date(minusDateTime.toString());

                const ddayJob = new CronJob(date, async () => {
                    let role: string;
                    if (userId === chkGroup.userId) role = 'host';
                    else role = 'attendance';
                    let input = {
                        groupId: chkGroup.groupId,
                        groupTitle: chkGroup.title,
                        category: 'Dday',
                        userId,
                        nickname,
                        role,
                    };
                    await this.groupRepository.addDdayAlarm(input);
                });

                this.schedulerRegistry.addCronJob(`dDay-${userId}`, ddayJob);
                ddayJob.start();

                console.log(this.schedulerRegistry.getCronJobs());

                return { applyPeople, applyState: true };
            }
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, 400);
        }
    }

    async getAttendance(groupId: string, userId: string): Promise<object> {
        try {
            let data: { [key: string]: object } = {};
            data.groupInfo = await this.groupRepository.getAttendance(groupId);
            data.applyUser = await this.groupRepository.getApplyUserByGroupId(
                groupId,
            );

            if (userId !== data.groupInfo['userId'])
                throw new HttpException(
                    '크루장만 출석체크를 할 수 있습니다',
                    400,
                );

            return data;
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, 400);
        }
    }
}
