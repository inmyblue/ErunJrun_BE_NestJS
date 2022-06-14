import { InjectRepository } from '@nestjs/typeorm';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets';
import * as dayjs from 'dayjs';
import { Socket } from 'socket.io';
import { Chats } from 'src/models/entities/Chats';
import { Users } from 'src/models/entities/Users';
import { Repository } from 'typeorm';

@WebSocketGateway({ cors: true })
export class ChatsGateway {
    constructor(
        @InjectRepository(Chats) private readonly Chats: Repository<Chats>,
        @InjectRepository(Users) private readonly Users: Repository<Users>,
    ) {}

    @SubscribeMessage('chatRoom')
    async handleMessage(
        @MessageBody() data: string[],
        @ConnectedSocket() socket: Socket,
    ) {
        const groupId = data[0];
        const userId = data[1];

        socket.join(groupId);
        const user = await this.Users.createQueryBuilder()
            .where('userId = :userId', { userId })
            .getOne();

        const exist = await this.Chats.createQueryBuilder()
            .where('groupId = :groupId', { groupId })
            .andWhere('userId = :userId', { userId })
            .getCount();

        if (exist === 0) {
            this.Chats.createQueryBuilder()
                .insert()
                .into(Chats)
                .values({
                    groupId,
                    userId,
                    nickname: user.nickname,
                    profileUrl: user.profileUrl,
                    message: `${user.nickname}님이 입장하셨습니다`,
                    type: 'enter',
                    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                })
                .execute();
        }
        return;
    }

    @SubscribeMessage('reqMessage')
    reqMessage(
        @MessageBody() data: string[],
        @ConnectedSocket() socket: Socket,
    ) {
        console.log('그룹아이디 : ', data[0]);
        console.log('유저아이디 : ', data[1]);
        console.log('메시지 : ', data[2]);

        console.log(socket);
    }
}
