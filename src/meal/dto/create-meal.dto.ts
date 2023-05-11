import { IsString, IsNumber, IsEmpty, IsNotEmpty, IsEnum } from 'class-validator'; 

import { Category } from '../schemas/meal.schema';
import { User } from '../../auth/schemas/user.schema';

export class CreateMealDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsNumber()
  readonly price: number;

  @IsNotEmpty()
  @IsEnum(Category, { message: 'Pelase enter correct category for this meal!' })
  readonly category: Category;

  @IsNotEmpty()
  readonly restaurant: string;

  @IsEmpty({ message: "You cannot manually provide an user ID!"})
  readonly user: User;
}