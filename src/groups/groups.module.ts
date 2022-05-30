import { Module } from '@nestjs/common';
import { GroupsController } from './controllers/groups.controller';
import { GroupsService } from './services/groups.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Groups } from 'src/models/entities/Groups';
import { GroupRepository } from './repository/groups.repository';
import { Users } from 'src/models/entities/Users';
import { Appliers } from 'src/models/entities/Appliers';
import { UserModule } from 'src/user/user.module';
import { Alarms } from 'src/models/entities/Alarms';

@Module({
    imports: [
        TypeOrmModule.forFeature([Groups, Users, Appliers, Alarms]),
        UserModule,
    ],
    controllers: [GroupsController],
    providers: [GroupsService, GroupRepository],
    exports: [GroupRepository],
})
export class GroupsModule {}
