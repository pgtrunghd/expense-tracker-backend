import { Category } from 'src/category/entities/category.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  amount: number;

  @Column({ type: 'timestamptz' })
  createDate: Date;

  @ManyToOne(() => Category, (category) => category.expenses)
  category: Category;

  @ManyToOne(() => User, (user) => user.expenses)
  user: User;
}
