import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId }from 'mongoose';
import { Query as ExpressQuery } from 'express-serve-static-core';

import { Restaurant } from './schemas/restaurant.schema';
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
  async create(restaurant: Restaurant): Promise<Restaurant> {
    return await this.restaurantModel.create(restaurant);
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
    const targetRestaurant = await this.findById(id);
    if(!targetRestaurant) throw new NotFoundException('Restaurant not found');

    return await this.restaurantModel.findByIdAndDelete(id);
  }

  // Upload Images => PUT /restaurants/upload/:id
  async uploadImages(id, files) {
    const images = await APIFeatures.uploadImage(files);

    return await this.restaurantModel.findByIdAndUpdate(id, {
      images: images as Object[]
    }, {
      new: true,
      runValidators: true
    });
  }

  async deleteImages(images) {
    if(images.length === 0) return true;
    return await APIFeatures.deleteImage(images);
  }
}