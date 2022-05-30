import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './Users';

@Index('FK_Users_TO_Badges_1', ['userId'], {})
@Entity('Badges', { schema: 'erunjrun' })
export class Badges {
  @Column('varchar', { primary: true, name: 'badgeId', length: 150 })
  @PrimaryGeneratedColumn('uuid')
  badgeId: string;

  @Column('varchar', { name: 'userId', length: 150 })
  userId: string;

  @Column('tinyint', { name: 'badge1', width: 1, default: () => "'0'" })
  badge1: boolean;

  @Column('tinyint', { name: 'badge2', width: 1, default: () => "'0'" })
  badge2: boolean;

  @Column('tinyint', { name: 'badge3', width: 1, default: () => "'0'" })
  badge3: boolean;

  @Column('tinyint', { name: 'badge4', width: 1, default: () => "'0'" })
  badge4: boolean;

  @Column('tinyint', { name: 'badge5', width: 1, default: () => "'0'" })
  badge5: boolean;

  @Column('tinyint', { name: 'badge6', width: 1, default: () => "'0'" })
  badge6: boolean;

  @ManyToOne(() => Users, (users) => users.badges, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
