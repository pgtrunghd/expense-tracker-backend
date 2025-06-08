import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  amount: number;

  @ManyToOne(() => User, (user) => user.budgets)
  user: User;

  @ManyToOne(() => Category, (category) => category.budgets)
  category: Category;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @Column()
  currentSpending: number;
}
