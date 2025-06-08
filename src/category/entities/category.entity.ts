import { Budget } from 'src/budget/entities/budget.entity';
import { Expense } from 'src/expense/entities/expense.entity';
import { Income } from 'src/income/entities/income.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  icon: string;

  @OneToMany(() => Expense, (expense) => expense.category)
  expenses: Expense[];

  @OneToMany(() => Income, (income) => income.category)
  incomes: Income[];

  @OneToMany(() => Budget, (budget) => budget.category)
  budgets: Budget[];

  @ManyToOne(() => User, (user) => user.categories)
  user: User;
}
