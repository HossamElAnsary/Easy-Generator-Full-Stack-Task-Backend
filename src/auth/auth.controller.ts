import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { User } from 'src/users/schemas/user.schema';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 15, ttl: 60 } })
  @Post('signup')
  @ApiOperation({ summary: 'User Signs Up' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    schema: {
      example: { accessToken: 'jwt.token.here' },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 15, ttl: 60 } })
  @Post('signin')
  @ApiOperation({ summary: 'User Signs In' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 201, description: 'Authenticated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed (extra or missing fields).',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async signIn(
    @Body() signInDto: SignInDto,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.signIn(req.user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 60 minutes
    });

    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get User Profile' })
  @ApiOkResponse({
    description: 'The authenticated user’s profile',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT',
  })
  getProfile(@GetUser() user: User) {
    return user;
  }
}
