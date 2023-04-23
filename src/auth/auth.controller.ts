import { Controller, Body, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register a new user
  @Post('signup')
  signUp(@Body() signUpDto:SignUpDto): Promise<{ token: string }> {
    return this.authService.signUp(signUpDto);
  }

  // Login user
  @Post('login')
  login(@Body() loginDto:LoginDto): Promise<{ token: string }> {
    return this.authService.login(loginDto);
  }
}
