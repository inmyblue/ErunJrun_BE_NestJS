import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Groups } from './Groups';
import { Users } from './Users';

@Index('FK_Groups_TO_Appliers_1', ['groupId'], {})
@Index('FK_Users_TO_Appliers_1', ['userId'], {})
@Entity('Appliers', { schema: 'erunjrun' })
export class Appliers extends BaseEntity {
    @Column('varchar', { primary: true, name: 'applyId', length: 150 })
    @PrimaryGeneratedColumn('uuid')
    applyId: string;

    @Column('varchar', { name: 'userId', length: 150 })
    userId: string;

    @Column('varchar', { name: 'groupId', length: 150 })
    groupId: string;

    @Column('tinyint', { name: 'attendance', width: 1, default: () => "'0'" })
    attendance: number;

    @Column('tinyint', { name: 'evaluation', width: 1, default: () => "'0'" })
    evaluation: number;

    @ManyToOne(() => Groups, (groups) => groups.appliers, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'groupId', referencedColumnName: 'groupId' }])
    group: Groups;

    @ManyToOne(() => Users, (users) => users.appliers, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
    user: Users;
}
