import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId }from 'mongoose';
import { Query as ExpressQuery } from 'express-serve-static-core';

import { Restaurant } from './schemas/restaurant.schema';
import { User } from '../auth/schemas/user.schema';
import APIFeatures from '../utils/apiFeatures.util';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<Restaurant>,
  ) {}

  // Get all Restaurants  =>  GET  /restaurants
  async findAll(query: ExpressQuery): Promise<Restaurant[]> {
    const resPerPage =  2;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query.keyword ? {
      name: {
        $regex: query.keyword,
        $options: 'i'
      }
    } : {};

    return await this.restaurantModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);
  }

  // Create new Restaurant  =>  POST  /restaurants
  async create(restaurant: Restaurant, user: User): Promise<Restaurant> {
    const location = await APIFeatures.getRestaurantLocation(restaurant.address);

    const data = Object.assign(restaurant, { 
      location,
      user: user._id
    });

    return await this.restaurantModel.create(data);
  }

  // Get a restaurant by id => GET / restaurants/:id
  async findById(id: string): Promise <Restaurant> {
    const isValidId = isValidObjectId(id);
    if(!isValidId) throw new BadRequestException('Wrong MongoDB Id. Please enter correct Id.');

    const restaurant = await this.restaurantModel.findById(id);
    if(!restaurant) throw new NotFoundException('Restaurant not found');

    return restaurant;
  }

  // Update a restaurant by ID => PUT /restaurants/:id
  async updateById(id: string, restaurant: Restaurant): Promise<Restaurant> {
    const targetRestaurant = await this.findById(id);
    if(!targetRestaurant) throw new NotFoundException('Restaurant not found');

    return await this.restaurantModel.findByIdAndUpdate(id, restaurant, {
      new: true,
      runValidators: true
    });
  }

  // Delete a restaurant by ID => DELETE /restaurants/:id
  async deleteById(id: string): Promise<Restaurant> {
    await this.findById(id);

    return await this.restaurantModel.findByIdAndDelete(id);
  }

  // Upload Images => PUT /restaurants/upload/:id
  async uploadImages(id: string, files: object[]) {
    const images = await APIFeatures.uploadImage(files);

    return await this.restaurantModel.findByIdAndUpdate(id, {
      images: images as object[]
    }, {
      new: true,
      runValidators: true
    });
  }

  async deleteImages(images: object[]) {
    if(images.length === 0) return true;
    return await APIFeatures.deleteImage(images);
  }
}