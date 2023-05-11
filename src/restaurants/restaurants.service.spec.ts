import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

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

describe('RestaruantService', () => {
  let service: RestaurantsService;
  let model: Model<Restaurant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getModelToken(Restaurant.name),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn()
          }
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    model = module.get<Model<Restaurant>>(getModelToken(Restaurant.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should get all restaurants', async () => {
      jest.spyOn(model, 'find').mockImplementationOnce(() => ({
        limit: () => ({
          skip: jest.fn().mockResolvedValue([mockRestaurant]),
        })
      } as any));

      const restaurants = await service.findAll({ keyword: 'restaurant' });
      expect(restaurants).toEqual([mockRestaurant]);
    }); 
  });

  describe('create', () => {
    const newRestaurant = {
      name: "Google Retaurant 173",
      description: "This is just another description",
      email: "john@test.com",
      phoneNo: 6265471234,
      address: "600 Amphitheatre Parkway Mountain View, CA 94043",
      category: "Fast Food"
    };

    it('should create a new restaurant', async () => {
      jest.spyOn(APIFeatures, 'getRestaurantLocation').mockImplementation(() => Promise.resolve(mockRestaurant.location));
      jest.spyOn(model, 'create').mockResolvedValueOnce(mockRestaurant as any);

      const result = await service.create(
        newRestaurant as CreateRestaurantDto,
        mockUser as User,
      ); 
      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('findById', () => {
    it('should get restaurant by Id', async () => {
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockRestaurant);

      const result = await service.findById(mockRestaurant._id);
      expect(result).toEqual(mockRestaurant);
    });

    it('should throw wrong mongoose id error', () => {
      expect(service.findById('wrongid')).rejects.toThrow(BadRequestException);
    });

    it('should throw restaurant not found error', async () => {
      const mockError = new NotFoundException('Restaurant not found');

      jest.spyOn(model, 'findById').mockRejectedValue(mockError);
    });
  });

  describe('updateById', () => {
    it('should update the restaurant', async () => {
      const updateRestaurant = { name: 'Souplantation 233' };
      const restaurant = { ...mockRestaurant, name: 'Souplantation 233' };
      
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockRestaurant);
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(restaurant);

      const updatedRestaurant = await service.updateById(restaurant._id, updateRestaurant as UpdateRestaurantDto);
      expect(updatedRestaurant.name).toEqual(updateRestaurant.name);
    });
  });

  describe('deletedById', () => {
    it('should delete a restaurant', async() => {
      const deleteMessage = { deleted: true };
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValueOnce(deleteMessage as { deleted: boolean });
      jest.spyOn(model, 'findById').mockResolvedValueOnce(mockRestaurant);

      const result = await service.deleteById(mockRestaurant._id);
      expect(result).toEqual(deleteMessage);
    });
  });

  describe('uploadImages', () => {
    it('should upload restaurant images on S3 Bucket', async () => {
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
      const updateRestaurant = { ...mockRestaurant, images: mockImages };

      jest.spyOn(APIFeatures, 'uploadImage').mockResolvedValueOnce(mockImages);
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValueOnce(updateRestaurant);

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

      const result = await service.uploadImages(mockRestaurant._id, files);
      expect(result).toEqual(updateRestaurant);
    });

    describe('deleteImages', () => {
      it('should delete restaurant images from S3 bucket', async() => {
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

        jest.spyOn(APIFeatures, 'deleteImage').mockResolvedValueOnce(true);

        const result = await service.deleteImages(mockImages);
        expect(result).toBe(true);
      });
    });
  })
});