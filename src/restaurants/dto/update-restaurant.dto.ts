import { IsEmpty, IsString, IsEmail, IsPhoneNumber, IsEnum, IsOptional } from 'class-validator';

import { Category } from '../schemas/restaurant.schema';
import { User } from '../../auth/schemas/user.schema';

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  readonly name: string;
  
  @IsString()
  @IsOptional()
  readonly description: string;
  
  @IsEmail()
  @IsOptional()
  readonly email: string;
  
  @IsPhoneNumber('US', { message: 'Please enter correct email address' })
  @IsOptional()
  readonly phoneNo: number;

  @IsString()
  @IsOptional()
  readonly address: string;
  
  @IsEnum(Category, { message: ' Please enter correct category' })
  @IsOptional()
  readonly category: Category;

  @IsEmpty({ message: 'You cannot manually provide the user ID!!' })
  readonly user: User;
}