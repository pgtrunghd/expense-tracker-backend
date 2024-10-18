import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  createDate: string;
}
