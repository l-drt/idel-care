import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'Marie' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1985-03-15' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ssn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '12 rue de la Santé' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  city: string;

  @ApiProperty({ example: '75014' })
  @IsString()
  postalCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  medicalHistory?: object;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  currentTreatments?: object;

  @ApiProperty({ example: true })
  @IsBoolean()
  consentGiven: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  consentDate?: string;
}
