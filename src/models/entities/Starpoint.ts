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

@Index('FK_Courses_TO_starpoint_1', ['courseId'], {})
@Index('FK_Users_TO_starpoint_1', ['userId'], {})
@Entity('starpoint', { schema: 'erunjrun' })
export class Starpoint {
  @Column('varchar', { primary: true, name: 'starPointId', length: 150 })
  @PrimaryGeneratedColumn('uuid')
  starPointId: string;

  @Column('varchar', { name: 'userId', length: 150 })
  userId: string;

  @Column('varchar', { name: 'courseId', length: 150 })
  courseId: string;

  @Column('int', { name: 'myStarPoint', nullable: true })
  myStarPoint: number | null;

  @ManyToOne(() => Courses, (courses) => courses.starpoints, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'courseId', referencedColumnName: 'courseId' }])
  course: Courses;

  @ManyToOne(() => Users, (users) => users.starpoints, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
