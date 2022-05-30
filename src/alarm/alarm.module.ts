import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarms } from 'src/models/entities/Alarms';
import { Appliers } from 'src/models/entities/Appliers';
import { Groups } from 'src/models/entities/Groups';
import { Users } from 'src/models/entities/Users';
import { UserModule } from 'src/user/user.module';
import { AlarmController } from './controllers/alarm.controller';
import { AlarmService } from './services/alarm.service';

@Module({
    controllers: [AlarmController],
    providers: [AlarmService],
    imports: [
        TypeOrmModule.forFeature([Alarms, Groups, Appliers, Users]),
        UserModule,
        ScheduleModule.forRoot(),
    ],
})
export class AlarmModule {}
