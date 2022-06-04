import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Bookmarks } from './Bookmarks';
import { Comments } from './Comments';
import { Users } from './Users';
import { Starpoint } from './Starpoint';

@Index('FK_Users_TO_Courses_1', ['userId'], {})
@Entity('Courses', { schema: 'erunjrun' })
export class Courses {
    @Column('varchar', { primary: true, name: 'courseId', length: 150 })
    @PrimaryGeneratedColumn('uuid')
    courseId: string;

    @Column('varchar', { name: 'userId', length: 150 })
    userId: string;

    @Column('varchar', { name: 'title', length: 150 })
    title: string;

    @Column('longtext', { name: 'content' })
    content: string;

    @Column('varchar', { name: 'location', length: 255 })
    location: string;

    @Column('float', { name: 'distance', precision: 12 })
    distance: number;

    @Column('varchar', { name: 'courseImageUrl1', length: 255 })
    courseImageUrl1: string;

    @Column('varchar', { name: 'courseImageUrl2', length: 255 })
    courseImageUrl2: string;

    @Column('varchar', { name: 'courseImageUrl3', length: 255 })
    courseImageUrl3: string;

    @Column('varchar', { name: 'mapLatLng', length: 255 })
    mapLatLng: string;

    @Column('float', {
        name: 'starPoint',
        nullable: true,
        precision: 12,
        default: () => '0',
    })
    starPoint: number | null;

    @Column('varchar', { name: 'baggage', length: 255 })
    baggage: string;

    @Column('varchar', { name: 'parking', length: 255 })
    parking: string;

    @Column('int', { name: 'clickCnt', nullable: false, default: () => '0' })
    clickCnt: string;

    @Column('int', { name: 'region', nullable: false })
    region: number;

    @Column('varchar', { name: 'thema', length: 20, nullable: false })
    thema: string;

    @Column('datetime', { name: 'createdAt', nullable: true })
    createdAt: string;

    @Column('datetime', { name: 'updatedAt', nullable: true })
    updatedAt: string;

    @OneToMany(() => Bookmarks, (bookmarks) => bookmarks.course)
    bookmarks: Bookmarks[];

    @OneToMany(() => Comments, (comments) => comments.course)
    comments: Comments[];

    @ManyToOne(() => Users, (users) => users.courses, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
    user: Users;

    @OneToMany(() => Starpoint, (starpoint) => starpoint.course)
    starpoints: Starpoint[];
}
