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

  @Column('datetime', { name: 'finishTime' })
  finishTime: Date;

  @Column('varchar', { name: 'courseImageUrl', length: 255 })
  courseImageUrl: string;

  @Column('varchar', { name: 'mapLatLng', length: 150 })
  mapLatLng: string;

  @Column('float', { name: 'starPoint', nullable: true, precision: 12 })
  starPoint: number | null;

  @Column('timestamp', { name: 'createdAt', nullable: true })
  createdAt: Date | null;

  @Column('timestamp', { name: 'updatedAt', nullable: true })
  updatedAt: Date | null;

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
