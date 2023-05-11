import { IsString, IsNumber, IsEmpty, IsNotEmpty, IsEnum, IsOptional } from 'class-validator'; 

import { Category } from '../schemas/meal.schema';
import { User } from '../../auth/schemas/user.schema';

export class UpdateMealDto {
  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsNumber()
  readonly price: number;

  @IsOptional()
  @IsEnum(Category, { message: 'Pelase enter correct category for this meal!' })
  readonly category: Category;

  @IsOptional()
  readonly restaurant: string;

  @IsEmpty({ message: "You cannot manually provide an user ID!"})
  readonly user: User;
}