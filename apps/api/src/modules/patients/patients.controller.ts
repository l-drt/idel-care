import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsService } from './patients.service';

type RequestWithUser = { user: { id: string }; ip?: string; headers?: { ['user-agent']?: string } };

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un patient (consentement obligatoire RGPD)' })
  create(@Body() dto: CreatePatientDto, @Req() req: RequestWithUser) {
    const ctx = { ipAddress: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.patientsService.create(dto, req.user.id, ctx);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des patients assignés (hors soft delete)' })
  findAll(@Req() req: RequestWithUser) {
    const ctx = { ipAddress: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.patientsService.findAllForNurse(req.user.id, ctx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d’un patient (audit PATIENT_VIEW)' })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { ipAddress: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.patientsService.findOneForNurse(id, req.user.id, ctx);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un patient (infirmier assigné)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @Req() req: RequestWithUser,
  ) {
    const ctx = { ipAddress: req.ip, userAgent: req.headers?.['user-agent'] };
    return this.patientsService.update(id, req.user.id, dto, ctx);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete patient (droit à l’oubli RGPD)' })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const ctx = { ipAddress: req.ip, userAgent: req.headers?.['user-agent'] };
    await this.patientsService.softDelete(id, req.user.id, ctx);
  }
}
