import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from './groups/groups.module';
import { MorganModule, MorganInterceptor } from 'nest-morgan';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AlarmModule } from './alarm/alarm.module';
import { CommentsModule } from './comments/comments.module';
import { MypageModule } from './mypage/mypage.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.MYSQLHOST,
            port: 3306,
            username: process.env.MYSQLUSERNAME,
            password: process.env.MYSQLUSERPWD,
            database: 'erunjrunService',
            entities: ['dist/models/entities/*.{ts,js}'],
            synchronize: false, //개발단계에서는 true, 서비스단계에서는 false
            autoLoadEntities: true,
            logging: true,
            keepConnectionAlive: true,
            timezone: 'Z',
        }),
        GroupsModule,
        MorganModule,
        UserModule,
        AlarmModule,
        CommentsModule,
        MypageModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_INTERCEPTOR, useClass: MorganInterceptor('combined') },
    ],
})
export class AppModule {}
