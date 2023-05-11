import { IsNotEmpty, IsEmpty, IsString, IsEmail, IsPhoneNumber, IsEnum } from 'class-validator';

import { Category } from '../schemas/restaurant.schema';
import { User } from '../../auth/schemas/user.schema';

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

  @IsEmpty({ message: 'You cannot manually provide the user ID!!' })
  readonly user: User;
}