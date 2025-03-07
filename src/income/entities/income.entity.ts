import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class Income {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  amount: number;

  @Column()
  createDate: Date;

  @ManyToOne(() => Category, (category) => category.incomes)
  category: Category;

  @ManyToOne(() => User, (user) => user.incomes)
  user: User;
}
