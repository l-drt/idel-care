import { Body, Controller, Get, Post, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, Verify2FADto, Enable2FADto, Choose2FAMethodDto, UnlockWithPasswordDto, ChangePasswordDto, DeleteAccountDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
@Throttle({ default: { limit: 5, ttl: 900_000 } }) // 5 tentatives / 15 min (exigence HDS)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 20, ttl: 900_000 } }) // 20 inscriptions / 15 min (limite plus souple que le login)
  @ApiOperation({ summary: 'Inscription (ouverte)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion (étape 1)' })
  async login(@Body() dto: LoginDto, @Req() req: { ip?: string; headers?: { ['user-agent']?: string } }) {
    return this.authService.login(dto, {
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });
  }

  @Post('choose-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Choisir la méthode 2FA (TOTP, SMS ou Email)' })
  async choose2FAMethod(@Body() dto: Choose2FAMethodDto) {
    return this.authService.choose2FAMethod(dto.userId, dto.method);
  }

  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérification code 2FA (étape 2)' })
  async verify2FA(@Body() dto: Verify2FADto, @Req() req: { ip?: string; headers?: { ['user-agent']?: string } }) {
    return this.authService.verify2FA(dto, {
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });
  }

  @Post('enable-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer 2FA (première connexion)' })
  async enable2FA(@Body() dto: Enable2FADto) {
    return this.authService.enable2FA(dto.userId, { code: dto.code });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('unlock-with-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déverrouiller l\'app avec le mot de passe (sans déconnexion)' })
  async unlockWithPassword(@Body() dto: UnlockWithPasswordDto) {
    return this.authService.unlockWithPassword(dto.userId, dto.password);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Changer le mot de passe (utilisateur connecté)' })
  async changePassword(@Req() req: { user: { id: string } }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion' })
  async logout(@Req() req: { user: { id: string }; ip?: string; headers?: { ['user-agent']?: string } }) {
    return this.authService.logout(req.user.id, {
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });
  }

  @Get('me/export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export des données personnelles (RGPD - portabilité)' })
  async exportMyData(@Req() req: { user: { id: string } }) {
    return this.authService.exportMyData(req.user.id);
  }

  @Post('me/delete-account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suppression du compte (RGPD - droit à l\'oubli)' })
  async deleteAccount(
    @Req() req: { user: { id: string }; ip?: string; headers?: { ['user-agent']?: string } },
    @Body() dto: DeleteAccountDto,
  ) {
    return this.authService.deleteAccount(req.user.id, dto.password, {
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });
  }
}
