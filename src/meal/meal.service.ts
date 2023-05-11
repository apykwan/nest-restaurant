import { ForbiddenException, Injectable, NotFoundException , BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { User } from '../auth/schemas/user.schema';
import { Meal } from './schemas/meal.schema';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealService {
  constructor(
    @InjectModel(Meal.name) 
    private mealModel: mongoose.Model<Meal>,
    @InjectModel(Restaurant.name) 
    private restaurantModel: mongoose.Model<Restaurant>
  ) {}

  // Get all meals => GET /meals
  async findAll(): Promise<Meal[]> {
    return await this.mealModel.find();
  }

  // Get all meals of a restaurant => GET /meals/restaurant/:id
  async findByRestaurant(id: string): Promise<Meal []> {
    return await this.mealModel.find({ restaurant: id });
  }

  // Create a new meal => POST /meals/:restaurant
  async create(meal: CreateMealDto , user: User): Promise<Meal> {
    const data = Object.assign(meal, { user: user._id });

    const mealCreated = await this.mealModel.create(data);

    // Saving meal ID in the restaurant menu
    const restaurant = await this.restaurantModel.findById(meal.restaurant);

    if(!restaurant) throw new NotFoundException('Restaurant not found with this ID.');

    // Check ownership fo the restaurant
    if(restaurant.user.toString() !== user._id.toString()) throw new ForbiddenException('Only the owner can add meal to this restaurant');

    restaurant.menu.push(mealCreated._id as any);
    await restaurant.save();

    return mealCreated;
  }

  // Get a meal with ID => GET /meal/:id
  async findById(id: string): Promise<Meal> {
    const isValidId = mongoose.isValidObjectId(id);

    if(!isValidId) throw new BadRequestException('Wrong Mongoose ID');

    const meal = await this.mealModel.findById(id);

    if(!meal) throw new NotFoundException('Meal not found with this ID');

    return meal;
  }

  // Update a meal => PUT /meals/:id
  async updateById(id: string, meal: UpdateMealDto): Promise<Meal> {
    return await this.mealModel.findByIdAndUpdate(id, meal, {
      new: true,
      runValidators: true
    });
  }

  // Delete meal by Id => DELETE /meals/:id
  async deleteById(id: string, user: User): Promise<{ deleted: boolean }> {
    const meal = await this.mealModel.findByIdAndDelete(id);

    // delete meal from restaruant's menu
    const restaurant = await this.restaurantModel.findById(meal.restaurant);
    if(!restaurant) throw new NotFoundException('Restaurant not found with this ID.');

    if(restaurant.user.toString() !== user._id.toString()) throw new ForbiddenException('Only the owner can remove meal to this restaurant');

    if (restaurant.menu.length > 0) {
      restaurant.menu = restaurant.menu.filter(item => String(item) !== id) ;
      restaurant.save();
    }
    
    if(meal) return { deleted: true };

    return { deleted: false };
  }
}
