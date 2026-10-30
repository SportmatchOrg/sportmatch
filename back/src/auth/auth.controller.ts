import {
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { extractBearerToken } from './bearer-token';
import { isAllowedOrigin } from './same-origin';
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  sessionCookieOptions,
} from './session-cookie';

@ApiTags('Autenticación')
@Controller('auth/session')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async create(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const idToken = extractBearerToken(request.headers.authorization);

    if (!idToken) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const sessionCookie = await this.authService.createSessionCookie(idToken);

    response.cookie(SESSION_COOKIE_NAME, sessionCookie, {
      ...sessionCookieOptions(this.frontUrl),
      maxAge: SESSION_DURATION_MS,
    });
  }

  @ApiCookieAuth()
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    if (!isAllowedOrigin(request, this.frontUrl)) {
      throw new ForbiddenException('Origin not allowed');
    }

    await this.authService.revokeSession(
      (request.cookies as Record<string, string> | undefined)?.[
        SESSION_COOKIE_NAME
      ],
    );

    response.clearCookie(
      SESSION_COOKIE_NAME,
      sessionCookieOptions(this.frontUrl),
    );
  }

  private get frontUrl(): string {
    return this.config.getOrThrow<string>('FRONT_URL');
  }
}
