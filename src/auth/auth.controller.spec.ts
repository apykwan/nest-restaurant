import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

const jwtToken = "jwtToken";

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {  
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
              signUp: jest.fn().mockResolvedValueOnce(jwtToken),
              login: jest.fn().mockResolvedValueOnce(jwtToken)
          }
        }
      ]
    }).compile();
    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => expect(controller).toBeDefined());

  describe('signUp', () => {
    it('should register a new user', async () => {
      const signUpDto: SignUpDto = {
        name: "John",
        email: "test@gmail.com",
        password: '123456'
      };

      const result = await controller.signUp(signUpDto);

      expect(service.signUp).toHaveBeenCalled();
      expect(result).toEqual(jwtToken);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const loginDto: LoginDto = {
        email: "test@gmail.com",
        password: '123456'
      };

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalled();
      expect(result).toEqual(jwtToken);
    });
  });
});