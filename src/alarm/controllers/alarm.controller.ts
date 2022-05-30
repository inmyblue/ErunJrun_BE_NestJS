import {
    Controller,
    Get,
    UseGuards,
    HttpException,
    Patch,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Users } from 'src/models/entities/Users';
import { GetUser } from 'src/user/auth.user.decorator';
import { JwtAuthGuard } from 'src/user/guards/jwt.auth.guard';
import { JwtPassGuard } from 'src/user/guards/jwt.pass.guard';
import { AlarmService } from '../services/alarm.service';

@Controller('alarm')
export class AlarmController {
    constructor(private readonly alarmService: AlarmService) {}

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getAlarms(@GetUser() user: Users): Promise<object> {
        try {
            const data = await this.alarmService.getAlarms(user.userId);
            const count = await this.alarmService.countAlarms(
                user.userId,
                false,
            );
            const unreadCount = await this.alarmService.countAlarms(
                user.userId,
                true,
            );

            return {
                success: true,
                data,
                count,
                unreadCount,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException('알림 불러오기 실패하였습니다', 400);
        }
    }

    @UseGuards(JwtPassGuard)
    @Patch('/')
    async readAlarm(@GetUser() user: Users) {
        try {
            await this.alarmService.readAlarm(user.userId);
            return {
                success: true,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException('새 알람 읽기에 실패했습니다', 400);
        }
    }

    // @Cron('20 * * * * *', { name: 'runningDay' })
    @Cron('0 0 8 * * *', { name: 'runningDay' })
    createRunningDay() {
        this.alarmService.createRunningDay();
    }
}
