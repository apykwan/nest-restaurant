import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
const bcrypt = require('bcryptjs');

import { AuthService } from './auth.service';
import {  UserRoles, User } from './schemas/user.schema';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import APIFeatures from '../utils/apiFeatures.util';

const mockUser = {
  _id: "6443d42011f15484d8d1c95e",
  email: "test@gmail.com",
  name: "john",
  role: UserRoles.USER,
  password: 'hashedPassword'
};

const token = "jwtToken";

describe('AuthService', () => {
  let service: AuthService;
  let model: Model<User>
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
        JwtModule.register({
          secret: '123456',
          signOptions: { expiresIn: '1d' }
        })
      ],
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn()          
          }
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => expect(service).toBeDefined());

  describe('signUp', () => {
    const signUpDto: SignUpDto = {
      name: "John",
      email: "test@gmail.com",
      password: '123456'
    };

    it('should register a new user', async() => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('testHash');
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockUser as any));

      jest.spyOn(APIFeatures, 'assignJwtToken').mockResolvedValueOnce(token);

      const result = await service.signUp(signUpDto);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result.token).toEqual(token);
    });

    it('should throw duplicate email error', async () => {
      jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.reject({ code: 11000 }));

      expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: "test@gmail.com",
      password: '123456'
    };

    it('should login user and return token', async () => {
      jest.spyOn(model, 'findOne').mockImplementationOnce(
        () => ({
          select: jest.fn().mockResolvedValueOnce(mockUser)
        } as any)
      );

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      jest.spyOn(APIFeatures, 'assignJwtToken').mockResolvedValueOnce(token);

      const result = await service.login(loginDto as LoginDto);
      
      expect(result.token).toEqual(token);
    });

    it('should throw invalid email error', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce({
          select: jest.fn().mockResolvedValueOnce(null)
        } as any);
      expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw invalid password error', async () => {
      jest.spyOn(model, 'findOne').mockReturnValueOnce({ select: jest.fn().mockResolvedValueOnce(mockUser) } as any);

      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
      expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});