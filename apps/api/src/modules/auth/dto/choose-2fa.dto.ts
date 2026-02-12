import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum TwoFactorMethodDto {
  TOTP = 'TOTP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export class Choose2FAMethodDto {
  @ApiProperty({ description: 'User ID from login response' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: TwoFactorMethodDto })
  @IsEnum(TwoFactorMethodDto)
  method: TwoFactorMethodDto;
}
