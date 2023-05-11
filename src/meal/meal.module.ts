import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RestaurantsModule } from '../restaurants/restaurants.module';
import { MealSchema } from './schemas/meal.schema';
import { MealService } from './meal.service';
import { MealController } from './meal.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Meal', schema: MealSchema }]),
    RestaurantsModule
  ],
  controllers: [MealController],
  providers: [MealService]
})
export class MealModule {}
