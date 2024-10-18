import { Expense } from 'src/expense/entities/expense.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  color: string;

  @OneToMany(() => Expense, (expense) => expense.category)
  expenses: Expense[];
}
