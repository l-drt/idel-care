import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class Verify2FADto {
  @ApiProperty({ description: 'User ID returned by login' })
  @IsString()
  userId: string;

  @ApiProperty({ description: '6-digit TOTP code', example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
