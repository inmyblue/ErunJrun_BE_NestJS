import { GroupsModule } from './../groups/groups.module';
import { Module } from '@nestjs/common';
import { MypageController } from './controllers/mypage.controller';
import { MypageService } from './services/mypage.service';
import { UserModule } from 'src/user/user.module';

@Module({
    controllers: [MypageController],
    providers: [MypageService],
    imports: [UserModule, GroupsModule],
})
export class MypageModule {}
