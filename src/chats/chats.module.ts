import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chats } from 'src/models/entities/Chats';
import { Users } from 'src/models/entities/Users';
import { ChatsGateway } from './chats.gateway';

@Module({
    providers: [ChatsGateway],
    imports: [TypeOrmModule.forFeature([Chats, Users])],
})
export class ChatsModule {}
