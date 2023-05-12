import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';

import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { Restaurant, Category } from './schemas/restaurant.schema';
import { UserRoles, User } from '../auth/schemas/user.schema';
import APIFeatures from '../utils/apiFeatures.util';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

const mockUser = {
  _id: "6443d42011f15484d8d1c95e",
  email: "test@gmail.com",
  name: "john",
  role: UserRoles.USER
};

const mockRestaurant =   {
  _id: "644722c5c571c6145fbe9c28",
  name: "Google Retaurant 173",
  description: "This is just another description",
  email: "john@test.com",
  phoneNo: 6265471234,
  address: "600 Amphitheatre Parkway Mountain View, CA 94043",
  category: Category.FAST_FOOD,
  images: [],
  location: {
    type: "Point",
    coordinates: [-122.08089, 37.4232],
    formattedAddress: "600 Amphitheatre Pkwy, Mountain View, CA 94043-1368, US",
    city: "Mountain View",
    state: "CA",
    zipcode: "94043-1368",
    country: "US"
  },
  menu: [],
  user: "6443d42011f15484d8d1c95e",
  createdAt: "2023-04-25T00:45:57.522Z",
  updatedAt: "2023-05-06T17:21:59.046Z",
};


describe('Restaurant controller', () => {
  let service: RestaurantsService;
  let controller: RestaurantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [RestaurantsController],
      providers: [
        {
          provide: RestaurantsService,
          useValue: {
            findAll: jest.fn().mockResolvedValueOnce([mockRestaurant]),
            create: jest.fn().mockResolvedValueOnce(mockRestaurant),
            findById: jest.fn().mockResolvedValueOnce(mockRestaurant),
            updateById: jest.fn(),
            deleteImages: jest.fn().mockResolvedValueOnce(true),
            deleteById: jest.fn().mockResolvedValueOnce({ deleted: true }),
            uploadImages: jest.fn().mockResolvedValueOnce(mockRestaurant)
          }
        }
      ]
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllRestaurants', () => {
    it('should get all restaurants', async () => {
      const result = await controller.getAllRestaurants({ keyword: 'restaurant' });
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockRestaurant]);
    })
  });

  describe('createRestaurant',  () => {
    it('should create a new restaurant', async () => {
        const newRestaurant = {
          name: "Google Retaurant 173",
          description: "This is just another description",
          email: "john@test.com",
          phoneNo: 6265471234,
          address: "600 Amphitheatre Parkway Mountain View, CA 94043",
          category: "Fast Food"
      };

      const result = await controller.createRestaurant(newRestaurant as CreateRestaurantDto, mockUser as User);

      expect(service.create).toHaveBeenCalled();
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('getRestaurantById', () => {
    it('should get restaurant by ID', async () => {
      const result = await controller.getRestaurant(mockRestaurant._id);

      expect(service.findById).toHaveBeenCalled();
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('updateRestaurant', () => {
    const restaurant = { ...mockRestaurant, name: 'Souplantation' };
    const updatedRestaurant = { name: 'Souplantation' };
    
    it('should update restaurant by ID', async () => {
      service.updateById = jest.fn().mockResolvedValueOnce({ ...mockRestaurant, name: 'Souplantation' });

      const result = await controller.updateRestaurant(restaurant._id as string, updatedRestaurant as UpdateRestaurantDto, mockUser as User);     
      
      expect(service.findById).toHaveBeenCalled();
      expect(service.updateById).toHaveBeenCalled();
      expect(result).toEqual(restaurant);
      expect(result.name).toEqual(restaurant.name);
    });

    it('should throw forbidden error', async () => {
      const user = { ...mockUser, _id: 'asdfadsf' };

      expect(controller
        .updateRestaurant(restaurant._id as string, updatedRestaurant as UpdateRestaurantDto, user as User))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteRestaurant', () => {
    it('should delete restaurant by ID', async () => {
      const result = await controller.deleteRestaurant(mockRestaurant._id as string, mockUser as User);

      expect(service.findById).toHaveBeenCalled();
      expect(service.deleteById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: true });
    });

    it('should not delete restaurant because images are not deleted', async () => {
      service.deleteImages = jest.fn().mockResolvedValueOnce(false);

      const result = await controller.deleteRestaurant(mockRestaurant._id as string, mockUser as User);

      expect(service.findById).toHaveBeenCalled();
      expect(result).toEqual({ deleted: false });
    });

    it('should throw forbidden error', async () => {
      const user = { ...mockUser, _id: 'asdfadsf' };

      expect(controller
        .deleteRestaurant(mockRestaurant._id as string, user as User))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('uploadFile', () => {
    it('should upload restaurant', async () => {
      const mockImages = [
        {
          ETag: '"f130032ca8fc855c9687e8e14e8f10df"',
          Location:
            'https://restarurant-api-bucket.s3.amazonaws.com/restaurants/image1.jpeg',
          key: 'restaurants/image1.jpeg',
          Key: 'restaurants/image1.jpeg',
          Bucket: 'restarurant-api-bucket',
        },
      ];
      const updatedRestaurant = { ...mockRestaurant, images: mockImages };

      const files = [
        {
          fieldname: 'files',
          originalname: 'image1.jpeg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer:
            '<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff e2 02 1c 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 02 0c 6c 63 6d 73 02 10 00 00 ... 19078 more bytes>',
          size: 19128,
        },
      ];

      service.uploadImages = jest.fn().mockResolvedValueOnce(updatedRestaurant);

      const result = await controller.uploadFiles(mockRestaurant._id as string, files as any);

      expect(service.uploadImages).toHaveBeenCalled();
      expect(result).toEqual(updatedRestaurant);
    });
  });
});