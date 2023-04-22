import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { FilesInterceptor } from '@nestjs/platform-express';

import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';
import APIFeatures from '../utils/apiFeatures.util';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  async getAllRestaurants(@Query() query: ExpressQuery): Promise<Restaurant[]> {
    console.log('request');
    return this.restaurantsService.findAll(query);
  }

  @Post()
  async createRestaurant(@Body() restaurant: CreateRestaurantDto ): Promise<Restaurant> {
    const location = await APIFeatures.getRestaurantLocation(restaurant.address); 
    
    const restaurantData = Object.assign(restaurant, { location });

    return this.restaurantsService.create(restaurantData);
  }

  @Get(":id")
  async getRestaurant(@Param('id') id: string): Promise<Restaurant> {
    return this.restaurantsService.findById(id);
  }

  @Put(':id')
  async updateRestaurant(@Param('id') id: string, @Body() restaurant: UpdateRestaurantDto): Promise<Restaurant> {
    return this.restaurantsService.updateById(id, restaurant);
  }

  @Delete(":id")
  async deleteRestaurant(@Param('id') id: string): Promise<{ deleted: Boolean }> {
    const restaurant = await this.restaurantsService.findById(id);

    const isDeleted = await this.restaurantsService.deleteImages(restaurant.images);

    if(isDeleted) {
      this.restaurantsService.deleteById(id);
      return { deleted: true };
    } else {
      return { deleted: false };
    }
  }

  @Put('upload/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    await this.restaurantsService.findById(id);

    return await this.restaurantsService.uploadImages(id, files);
  }
}