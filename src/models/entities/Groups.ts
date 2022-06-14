import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Appliers } from './Appliers';
import { Comments } from './Comments';
import { Users } from './Users';
import { Chats } from './Chats';

@Index('FK_Users_TO_Groups_1', ['userId'], {})
@Entity('Groups', { schema: 'erunjrun' })
export class Groups extends BaseEntity {
    @Column('varchar', { primary: true, name: 'groupId', length: 150 })
    @PrimaryGeneratedColumn('uuid')
    groupId: string;

    @Column('varchar', { name: 'userId', length: 150 })
    userId: string;

    @Column('longtext', { name: 'mapLatLng' })
    mapLatLng: string;

    @Column('varchar', { name: 'thumbnailUrl1', nullable: true, length: 255 })
    thumbnailUrl1: string | null;

    @Column('varchar', { name: 'title', length: 150 })
    title: string;

    @Column('int', { name: 'maxPeople' })
    maxPeople: number;

    @Column('date', { name: 'date' })
    date: string;

    @Column('time', { name: 'standbyTime' })
    standbyTime: string;

    @Column('float', { name: 'distance', precision: 12 })
    distance: number;

    @Column('varchar', { name: 'speed', length: 50 })
    speed: string;

    @Column('varchar', { name: 'location', length: 200 })
    location: string;

    @Column('varchar', { name: 'parking', nullable: true, length: 255 })
    parking: string | null;

    @Column('varchar', { name: 'baggage', nullable: true, length: 255 })
    baggage: string | null;

    @Column('longtext', { name: 'content', nullable: true })
    content: string | null;

    @Column('timestamp', { name: 'createdAt', nullable: true })
    // @CreateDateColumn()
    createdAt: string;

    @Column('timestamp', { name: 'updatedAt', nullable: true })
    // @UpdateDateColumn()
    updatedAt: string;

    @Column('varchar', { name: 'thumbnailUrl2', nullable: true, length: 255 })
    thumbnailUrl2: string | null;

    @Column('varchar', { name: 'thumbnailUrl3', nullable: true, length: 255 })
    thumbnailUrl3: string | null;

    @Column('int', { name: 'region' })
    region: number;

    @Column('int', { name: 'timecode' })
    timecode: number;

    @Column('varchar', { name: 'thema', nullable: false, length: 20 })
    thema: string;

    @Column('varchar', { name: 'chattingRoom', nullable: false, length: 255 })
    chattingRoom: string;

    @OneToMany(() => Appliers, (appliers) => appliers.group)
    appliers: Appliers[];

    @OneToMany(() => Comments, (comments) => comments.group)
    comments: Comments[];

    @OneToMany(() => Chats, (chats) => chats.group)
    chats: Chats[];

    @ManyToOne(() => Users, (users) => users.groups, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
    user: Users;
}
