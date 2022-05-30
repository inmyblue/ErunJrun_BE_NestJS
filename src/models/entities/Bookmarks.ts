import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Courses } from './Courses';
import { Users } from './Users';

@Index('FK_Courses_TO_Bookmarks_1', ['courseId'], {})
@Index('FK_Users_TO_Bookmarks_1', ['userId'], {})
@Entity('Bookmarks', { schema: 'erunjrun' })
export class Bookmarks {
  @Column('varchar', { primary: true, name: 'bookmarkId', length: 150 })
  @PrimaryGeneratedColumn('uuid')
  bookmarkId: string;

  @Column('varchar', { name: 'courseId', length: 150 })
  courseId: string;

  @Column('varchar', { name: 'userId', length: 150 })
  userId: string;

  @ManyToOne(() => Courses, (courses) => courses.bookmarks, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'courseId', referencedColumnName: 'courseId' }])
  course: Courses;

  @ManyToOne(() => Users, (users) => users.bookmarks, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
