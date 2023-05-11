import { Controller, Post, Get, Body, Param, Put, Delete, UseGuards, ForbiddenException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { Meal } from './schemas/meal.schema';
import { User } from '../auth/schemas/user.schema';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MealService } from './meal.service';

@Controller('meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get()
  async getAllMeals(): Promise<Meal[]> {
    return this.mealService.findAll();
  }

  @Get('restaurant/:id')
  async getMealsByRestaurant(@Param('id') id: string): Promise<Meal[]> {
    console.log(id);
    return this.mealService.findByRestaurant(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createMeal(
    @Body() createMealDto: CreateMealDto,
    @CurrentUser() user: User
  ): Promise<Meal> {
    return this.mealService.create(createMealDto, user);
  } 

  @Get(':id')
  async getMeal(@Param('id') id: string) {
    return this.mealService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateMeal(
    @Body() updateMealDto: UpdateMealDto,
    @Param('id') id: string,
    @CurrentUser() user: User
  ): Promise<Meal> {
    const meal = await this.mealService.findById(id);
    if(meal.user.toString() !== user._id.toString()) throw new ForbiddenException('You can not update this meal');

    return this.mealService.updateById(id, updateMealDto);
  } 

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteMeal(@Param('id') id: string, @CurrentUser() user: User) {
    const meal = await this.mealService.findById(id);
    if(meal.user.toString() !== user._id.toString()) throw new ForbiddenException('You can not update this meal');

    return this.mealService.deleteById(id, user);
  }
}
