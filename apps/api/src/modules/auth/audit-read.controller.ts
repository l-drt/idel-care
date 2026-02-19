import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../database/generated/client';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles, RolesGuard } from './guards/roles.guard';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AuditReadController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des derniers logs d’audit (réservé ADMIN)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre max (défaut 100, max 500)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Décalage pour pagination' })
  getLogs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = Math.min(parseInt(limit || '100', 10) || 100, 500);
    const offsetNum = parseInt(offset || '0', 10) || 0;
    return this.audit.findRecent(limitNum, offsetNum);
  }
}
