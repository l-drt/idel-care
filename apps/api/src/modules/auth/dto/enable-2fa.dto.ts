import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class Enable2FADto {
  @ApiProperty({ description: 'User ID returned by login (requires2FASetup)' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '6-digit TOTP code from authenticator app', example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
