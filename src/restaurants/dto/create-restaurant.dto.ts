import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber, IsEnum } from 'class-validator';

import { Category } from '../schemas/restaurant.schema';

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;
  
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
  
  @IsNotEmpty()
  @IsPhoneNumber('US', { message: 'Please enter correct email address' })
  readonly phoneNo: number;

  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @IsNotEmpty()
  @IsEnum(Category, { message: ' Please enter correct category' })
  readonly category: Category;
}