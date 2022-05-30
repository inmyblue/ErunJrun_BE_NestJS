import {
    BaseEntity,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Alarms } from './Alarms';
import { Appliers } from './Appliers';
import { Badges } from './Badges';
import { Bookmarks } from './Bookmarks';
import { Comments } from './Comments';
import { Courses } from './Courses';
import { Groups } from './Groups';
import { Recomments } from './Recomments';
import { Starpoint } from './Starpoint';

@Entity('Users', { schema: 'erunjrun' })
export class Users extends BaseEntity {
    @Column('varchar', { primary: true, name: 'userId', length: 150 })
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column('varchar', { name: 'nickname', length: 150 })
    nickname: string;

    @Column('varchar', { name: 'bio', nullable: true, length: 255 })
    bio: string | null;

    @Column('varchar', { name: 'profileUrl', length: 200 })
    profileUrl: string;

    @Column('varchar', { name: 'likeLocation', nullable: true, length: 100 })
    likeLocation: string | null;

    @Column('varchar', { name: 'likeDistance', nullable: true, length: 50 })
    likeDistance: string | null;

    @Column('varchar', { name: 'userLevel', nullable: true, length: 50 })
    userLevel: string | null;

    @Column('float', { name: 'mannerPoint', nullable: true, precision: 12 })
    mannerPoint: number | null;

    @Column('varchar', { name: 'social', nullable: true, length: 100 })
    social: string | null;

    @Column('varchar', { name: 'socialId', nullable: true, length: 255 })
    socialId: string | null;

    @Column('varchar', { name: 'phone', nullable: true, length: 100 })
    phone: string | null;

    @Column('tinyint', {
        name: 'agreeSMS',
        nullable: false,
        width: 1,
        default: () => "'0'",
    })
    agreeSMS: number;

    @OneToMany(() => Alarms, (alarms) => alarms.user)
    alarms: Alarms[];

    @OneToMany(() => Appliers, (appliers) => appliers.user)
    appliers: Appliers[];

    @OneToMany(() => Badges, (badges) => badges.user)
    badges: Badges[];

    @OneToMany(() => Bookmarks, (bookmarks) => bookmarks.user)
    bookmarks: Bookmarks[];

    @OneToMany(() => Comments, (comments) => comments.user)
    comments: Comments[];

    @OneToMany(() => Courses, (courses) => courses.user)
    courses: Courses[];

    @OneToMany(() => Groups, (groups) => groups.user)
    groups: Groups[];

    @OneToMany(() => Recomments, (recomments) => recomments.user)
    recomments: Recomments[];

    @OneToMany(() => Starpoint, (starpoint) => starpoint.user)
    starpoints: Starpoint[];
}
