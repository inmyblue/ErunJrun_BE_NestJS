import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Alarms } from 'src/models/entities/Alarms';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { Groups } from 'src/models/entities/Groups';
import { Appliers } from 'src/models/entities/Appliers';
import { Users } from 'src/models/entities/Users';

@Injectable()
export class AlarmService {
    constructor(
        @InjectRepository(Alarms) private readonly Alarms: Repository<Alarms>,
        @InjectRepository(Groups) private readonly Groups: Repository<Groups>,
        @InjectRepository(Appliers)
        private readonly Appliers: Repository<Appliers>,
        @InjectRepository(Users) private readonly Users: Repository<Users>,
    ) {}
    async getAlarms(userId: string): Promise<object> {
        const data = await this.Alarms.createQueryBuilder()
            .where('userId = :userId', { userId })
            .orderBy('createdAt')
            .getMany()
            .then((result) => {
                for (const row of result) {
                    row.createdAt = this.timeForToday(row.createdAt);
                    delete row.updatedAt;
                    delete row.alarmId;
                    delete row.userId;
                }
                return result;
            });

        return data;
    }

    async countAlarms(userId: string, chkRead: Boolean): Promise<number> {
        let data = this.Alarms.createQueryBuilder().where('userId = :userId', {
            userId,
        });

        if (chkRead === true) {
            data.andWhere('Alarms.check = 0');
        }

        return data.getCount();
    }

    readAlarm(userId: string) {
        return this.Alarms.createQueryBuilder()
            .update(Alarms)
            .set({ check: 1 })
            .where('userId = :userId', { userId })
            .execute();
    }

    addAlarm(input: { [key: string]: string }) {
        const { groupId, groupTitle, category, userId, role, nickname } = input;
        return this.Alarms.createQueryBuilder()
            .insert()
            .values({ groupId, groupTitle, category, userId, role, nickname })
            .execute();
    }

    async createRunningDay() {
        const nowDate = dayjs().format('YYYY-MM-DD');

        const data = await this.Groups.createQueryBuilder()
            .select(['groupId', 'userId', 'title'])
            .where('date = :date', { date: nowDate })
            .getRawMany();

        for (const row of data) {
            await this.Appliers.createQueryBuilder()
                .select(['userId'])
                .where('groupId = :groupId', { groupId: row.groupId })
                .getRawMany()
                .then(async (result) => {
                    let input: { [key: string]: string } = {
                        groupId: row.groupId,
                        groupTitle: row.title,
                        category: 'Dday',
                    };
                    for (const applierRow of result) {
                        input.userId = applierRow.userId;
                        const user = await Users.createQueryBuilder()
                            .select('nickname')
                            .where('userId = :userId', {
                                userId: applierRow.userId,
                            })
                            .getRawOne();
                        input.nickname = user.nickname;

                        if (row.userId === applierRow.userId) {
                            input.role = 'host';
                        } else {
                            input.role = 'attendance';
                        }

                        this.addAlarm(input);
                    }
                });
        }

        return;
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
}
