import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Courses } from './Courses';
import { Groups } from './Groups';
import { Users } from './Users';
import { Recomments } from './Recomments';

@Index('FK_Courses_TO_Comments_1', ['courseId'], {})
@Index('FK_Groups_TO_Comments_1', ['groupId'], {})
@Index('FK_Users_TO_Comments_1', ['userId'], {})
@Entity('Comments', { schema: 'erunjrun' })
export class Comments extends BaseEntity {
    @Column('varchar', { primary: true, name: 'commentId', length: 150 })
    @PrimaryGeneratedColumn('uuid')
    commentId: string;

    @Column('varchar', { name: 'groupId', nullable: true, length: 150 })
    groupId: string | null;

    @Column('varchar', { name: 'userId', length: 150 })
    userId: string;

    @Column('varchar', { name: 'courseId', nullable: true, length: 150 })
    courseId: string | null;

    @Column('longtext', { name: 'content', nullable: true })
    content: string | null;

    @Column('timestamp', { name: 'createdAt', nullable: true })
    createdAt: Date | string | null;

    @Column('timestamp', { name: 'updatedAt', nullable: true })
    updatedAt: Date | null;

    @ManyToOne(() => Courses, (courses) => courses.comments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'courseId', referencedColumnName: 'courseId' }])
    course: Courses;

    @ManyToOne(() => Groups, (groups) => groups.comments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'groupId', referencedColumnName: 'groupId' }])
    group: Groups;

    @ManyToOne(() => Users, (users) => users.comments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
    user: Users;

    @OneToMany(() => Recomments, (recomments) => recomments.comment)
    recomments: Recomments[];
}
