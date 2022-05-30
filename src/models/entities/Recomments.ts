import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Comments } from './Comments';
import { Users } from './Users';

@Index('FK_Comments_TO_Recomments_1', ['commentId'], {})
@Index('FK_Users_TO_Recomments_1', ['userId'], {})
@Entity('Recomments', { schema: 'erunjrun' })
export class Recomments {
    @Column('varchar', { primary: true, name: 'recommentId', length: 150 })
    @PrimaryGeneratedColumn('uuid')
    recommentId: string;

    @Column('varchar', { name: 'commentId', length: 150 })
    commentId: string;

    @Column('varchar', { name: 'userId', length: 150 })
    userId: string;

    @Column('longtext', { name: 'content', nullable: true })
    content: string | null;

    @Column('timestamp', { name: 'createdAt', nullable: true })
    createdAt: Date | string | null;

    @Column('timestamp', { name: 'updatedAt', nullable: true })
    updatedAt: Date | null;

    @ManyToOne(() => Comments, (comments) => comments.recomments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'commentId', referencedColumnName: 'commentId' }])
    comment: Comments;

    @ManyToOne(() => Users, (users) => users.recomments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
    user: Users;
}
