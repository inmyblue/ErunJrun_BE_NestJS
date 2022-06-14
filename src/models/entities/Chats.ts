import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Groups } from './Groups';
import { Users } from './Users';

@Entity('Chats', { schema: 'erunjrun' })
export class Chats {
    @Column('int', { name: 'chatId', default: () => 0 })
    @PrimaryGeneratedColumn()
    chatId: number;

    @Column('varchar', { name: 'groupId', length: 150 })
    groupId: string;

    @Column('varchar', { name: 'userId', length: 150 })
    userId: string;

    @Column('varchar', { name: 'nickname', length: 150 })
    nickname: string;

    @Column('varchar', { name: 'profileUrl', length: 255 })
    profileUrl: string;

    @Column('longtext', { name: 'message' })
    message: string;

    @Column('varchar', { name: 'type', length: 50 })
    type: string;

    @Column('timestamp', { name: 'createdAt', nullable: false })
    createdAt: string;

    @ManyToOne(() => Groups, (groups) => groups.chats, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'groupId', referencedColumnName: 'groupId' }])
    group: Groups;
    @ManyToOne(() => Users, (users) => users.groups, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
    user: Users;
}
