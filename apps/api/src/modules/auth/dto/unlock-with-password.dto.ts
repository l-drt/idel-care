import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UnlockWithPasswordDto {
  @ApiProperty({ description: 'User ID (session déjà établie, déverrouillage local uniquement)' })
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Le mot de passe est requis.' })
  password: string;
}
