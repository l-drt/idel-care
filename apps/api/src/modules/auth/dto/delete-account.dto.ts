import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ description: 'Mot de passe actuel (confirmation)' })
  @IsString()
  @MinLength(1, { message: 'Le mot de passe est requis pour confirmer la suppression.' })
  password: string;
}
