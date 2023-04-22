import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const bcrypt = require('bcryptjs');

import { User } from './schemas/user.schema';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  // Register User
  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { name, email, password } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.UserModel.create({ name, email, password: hashedPassword });
    } catch (err) {
      if(err.code === 11000) throw new ConflictException('This Email has been taken!');
    }
  }

  //Login User
  async login(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.UserModel.findOne({ email }).select('+password');
    if (!user) throw new UnauthorizedException('Invlid email or password');

    // Check if password is correct or not
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) throw new UnauthorizedException('Invlid email or password');

    user.password = null;
    return user;
  }

}
