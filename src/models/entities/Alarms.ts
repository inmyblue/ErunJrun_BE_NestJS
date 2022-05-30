import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';

@Index('FK_Users_TO_Alarms_1', ['userId'], {})
@Entity('Alarms', { schema: 'erunjrun' })
export class Alarms {
    @Column('varchar', { primary: true, name: 'alarmId', length: 150 })
    @PrimaryGeneratedColumn('uuid')
    alarmId: string;

    @Column('varchar', { name: 'userId', length: 150 })
    userId: string;

    @Column('varchar', { name: 'category', length: 150 })
    category: string;

    @Column('varchar', { name: 'courseId', nullable: true, length: 150 })
    courseId: string | null;

    @Column('varchar', { name: 'courseTitle', nullable: true, length: 150 })
    courseTitle: string | null;

    @Column('varchar', { name: 'groupId', nullable: true, length: 150 })
    groupId: string | null;

    @Column('varchar', { name: 'groupTitle', nullable: true, length: 150 })
    groupTitle: string | null;

    @Column('varchar', { name: 'nickname', nullable: true, length: 150 })
    nickname: string | null;

    @Column('varchar', { name: 'role', nullable: true, length: 100 })
    role: string | null;

    @Column('tinyint', { name: 'check', width: 1, default: () => "'0'" })
    check: number;

    @Column('varchar', { name: 'commentId', nullable: true, length: 150 })
    commentId: string | null;

    @Column('timestamp', { name: 'createdAt', nullable: true })
    createdAt: Date | string | null;

    @Column('timestamp', { name: 'updatedAt', nullable: true })
    updatedAt: Date | null;

    @ManyToOne(() => Users, (users) => users.alarms, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
    user: Users;
}
