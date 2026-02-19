import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UserRole } from '../../database/generated/client';
import { randomInt } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { RegisterDto, LoginDto, Verify2FADto, Enable2FADto } from './dto';
import { TwoFactorMethodDto } from './dto/choose-2fa.dto';

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;

export interface AuthContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cette adresse email.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone?.trim() || null,
        role: UserRole.NURSE,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      user,
      message: 'Compte créé. Connectez-vous pour activer la double authentification (2FA).',
    };
  }

  async login(dto: LoginDto, ctx?: AuthContext) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      await this.audit.log({
        action: 'LOGIN_FAILURE',
        resourceType: 'auth',
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
      });
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.audit.log({
        action: 'LOGIN_FAILURE',
        resourceType: 'auth',
        userId: user.id,
        ipAddress: ctx?.ipAddress,
        userAgent: ctx?.userAgent,
      });
      throw new UnauthorizedException('Identifiants invalides.');
    }

    await this.audit.log({
      action: 'LOGIN_STEP1_SUCCESS',
      resourceType: 'auth',
      resourceId: user.id,
      userId: user.id,
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });

    if (!user.totpEnabled) {
      return {
        requires2FASetup: true,
        userId: user.id,
        needMethodChoice: true,
      };
    }

    const method = user.twoFactorMethod as string;

    if (method === 'SMS' || method === 'EMAIL') {
      const code = await this.createAndSendCode(user.id, method);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[2FA ${method}] Code for ${user.id}: ${code}`);
      }
      return {
        requires2FA: true,
        userId: user.id,
        method,
      };
    }

    return {
      requires2FA: true,
      userId: user.id,
      method: 'TOTP',
    };
  }

  async choose2FAMethod(userId: string, method: TwoFactorMethodDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.totpEnabled) {
      throw new UnauthorizedException('Session invalide.');
    }

    const methodStr = method as string;

    if (methodStr === 'TOTP') {
      const secret = speakeasy.generateSecret({
        name: `IDEL Care (${user.email})`,
        issuer: 'IDEL Care',
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: { totpSecret: secret.base32, twoFactorMethod: 'TOTP' },
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
      return {
        method: 'TOTP',
        qrCode,
        secret: secret.base32,
      };
    }

    if (methodStr === 'SMS') {
      if (!user.phone?.trim()) {
        throw new BadRequestException('Numéro de téléphone requis pour la 2FA par SMS.');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorMethod: 'SMS' },
      });
      const code = await this.createAndSendCode(userId, 'SMS');
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[2FA SMS] Code for ${userId}: ${code}`);
      }
      return { method: 'SMS', message: 'Code envoyé par SMS.' };
    }

    if (methodStr === 'EMAIL') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { twoFactorMethod: 'EMAIL' },
      });
      const code = await this.createAndSendCode(userId, 'EMAIL');
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[2FA EMAIL] Code for ${user.email}: ${code}`);
      }
      return { method: 'EMAIL', message: 'Code envoyé par email.' };
    }

    throw new BadRequestException('Méthode invalide.');
  }

  async verify2FA(dto: Verify2FADto, ctx?: AuthContext) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Session invalide.');
    }

    const method = user.twoFactorMethod as string;
    let valid = false;

    if (method === 'TOTP' && user.totpSecret) {
      valid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: dto.code,
        window: 2,
      });
    } else if (method === 'SMS' || method === 'EMAIL') {
      const otc = await this.prisma.oneTimeCode.findFirst({
        where: {
          userId: dto.userId,
          code: dto.code,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (otc) {
        valid = true;
        await this.prisma.oneTimeCode.delete({ where: { id: otc.id } });
      }
    }

    if (!valid) {
      throw new UnauthorizedException('Code 2FA invalide.');
    }

    await this.audit.log({
      action: 'LOGIN_2FA_SUCCESS',
      resourceType: 'auth',
      resourceId: user.id,
      userId: user.id,
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });

    if (!user.totpEnabled) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { totpEnabled: true, totpVerifiedAt: new Date() },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const updated = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    return this.generateTokens(updated);
  }

  async enable2FA(userId: string, dto: { code: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('Session invalide.');
    }

    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: dto.code,
      window: 2,
    });

    if (!valid) {
      throw new UnauthorizedException('Code invalide.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true, totpVerifiedAt: new Date() },
    });

    const updated = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return this.generateTokens(updated);
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Token invalide ou expiré.');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokens(stored.user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Session invalide.');
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Mot de passe actuel incorrect.');
    }
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Mot de passe modifié.' };
  }

  async logout(userId: string, ctx?: AuthContext) {
    await this.audit.log({
      action: 'LOGOUT',
      resourceType: 'auth',
      resourceId: userId,
      userId,
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Déconnexion réussie.' };
  }

  /**
   * Export des données personnelles (RGPD - droit à la portabilité).
   * Retourne toutes les données liées au compte utilisateur (profil, patients assignés, activités, etc.).
   */
  async exportMyData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        twoFactorMethod: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Session invalide.');
    }
    const { isActive: _, ...userExport } = user;

    const [assignments, careActivities, vitalsRecorded, tours] = await Promise.all([
      this.prisma.patientAssignment.findMany({
        where: { nurseId: userId },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              birthDate: true,
              consentGiven: true,
              consentDate: true,
              address: true,
              city: true,
              postalCode: true,
              phone: true,
              email: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.careActivity.findMany({
        where: { nurseId: userId },
        select: {
          id: true,
          patientId: true,
          careType: true,
          scheduledAt: true,
          completedAt: true,
          notes: true,
        },
      }),
      this.prisma.vitalSign.findMany({
        where: { recordedById: userId },
        select: {
          id: true,
          patientId: true,
          recordedAt: true,
          bloodPressureSystolic: true,
          bloodPressureDiastolic: true,
          heartRate: true,
          temperature: true,
          spo2: true,
          weight: true,
          isAbnormal: true,
        },
      }),
      this.prisma.tour.findMany({
        where: { nurseId: userId },
        select: {
          id: true,
          date: true,
          totalDistanceKm: true,
          estimatedDurationMinutes: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      purpose: 'Export RGPD - droit à la portabilité (article 20)',
      user: userExport,
      patientsAssigned: assignments,
      careActivities,
      vitalsRecorded,
      tours,
    };
  }

  /**
   * Suppression du compte (RGPD - droit à l'oubli). Anonymise les données personnelles et désactive le compte.
   */
  async deleteAccount(userId: string, password: string, ctx?: AuthContext) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Session invalide.');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Mot de passe incorrect.');
    }

    const anonymizedEmail = `deleted-${user.id}@anon.local`;
    const deadHash = await bcrypt.hash(randomInt(1e12, 9e12).toString(), BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: anonymizedEmail,
        firstName: 'Compte supprimé',
        lastName: '—',
        phone: null,
        passwordHash: deadHash,
        totpSecret: null,
        totpEnabled: false,
        totpVerifiedAt: null,
        twoFactorMethod: 'TOTP',
      },
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.prisma.oneTimeCode.deleteMany({ where: { userId } });

    await this.audit.log({
      action: 'ACCOUNT_DELETED',
      resourceType: 'auth',
      resourceId: userId,
      userId,
      ipAddress: ctx?.ipAddress,
      userAgent: ctx?.userAgent,
    });

    return { message: 'Compte supprimé. Vos données ont été anonymisées.' };
  }

  /**
   * Vérifie le mot de passe pour déverrouiller l'app (sans créer de session).
   * Utilisé quand Face ID / Touch ID échoue : l'utilisateur prouve qu'il connaît le mot de passe
   * pour accéder à la session déjà établie (tokens conservés). Conforme HDS : pas de bypass 2FA.
   */
  async unlockWithPassword(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Session invalide.');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Mot de passe incorrect.');
    }
    return { success: true };
  }

  private async createAndSendCode(userId: string, channel: 'SMS' | 'EMAIL'): Promise<string> {
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    await this.prisma.oneTimeCode.create({
      data: { userId, code, expiresAt },
    });

    // TODO: en prod, envoyer via OVH SMS ou Brevo selon channel
    return code;
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  }) {
    const secret = this.config.get<string>('JWT_SECRET', 'default-secret-change-me');
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '15m');
    const refreshExpires = this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d');

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret, expiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { secret, expiresIn: refreshExpires },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
