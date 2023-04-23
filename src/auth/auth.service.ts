import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
const bcrypt = require('bcryptjs');

import { User } from './schemas/user.schema';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import APIFeatures from '../utils/apiFeatures.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) 
    private UserModel: Model<User>,
    private jwtService: JwtService
  ) {}

  // Register User
  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const { name, email, password } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.UserModel.create({ name, email, password: hashedPassword });

      const token = await APIFeatures.assignJwtToken(user._id, this.jwtService);
      return { token };
    } catch (err) {
      if(err.code === 11000) throw new ConflictException('This Email has been taken!');
    }
  }

  //Login User
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.UserModel.findOne({ email }).select('+password');
    if (!user) throw new UnauthorizedException('Invlid email or password');

    // Check if password is correct or not
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) throw new UnauthorizedException('Invlid email or password');

    const token = await APIFeatures.assignJwtToken(user._id, this.jwtService);
    return { token };
  }

}
