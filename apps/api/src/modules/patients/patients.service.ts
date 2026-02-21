import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

export interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreatePatientDto, nurseId: string, ctx?: AuditContext) {
    const birthDate = new Date(dto.birthDate);
    const consentDate = dto.consentDate ? new Date(dto.consentDate) : null;
    const patient = await this.prisma.patient.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        birthDate,
        ssn: dto.ssn ?? null,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
        address: dto.address,
        city: dto.city,
        postalCode: dto.postalCode,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        medicalHistory: (dto.medicalHistory as object) ?? undefined,
        allergies: dto.allergies ?? [],
        currentTreatments: (dto.currentTreatments as object) ?? undefined,
        consentGiven: dto.consentGiven,
        consentDate,
      },
    });
    await this.prisma.patientAssignment.create({
      data: { patientId: patient.id, nurseId },
    });
    await this.audit.log({
      action: 'PATIENT_CREATE',
      resourceType: 'Patient',
      resourceId: patient.id,
      userId: nurseId,
      ipAddress: ctx?.ipAddress ?? undefined,
      userAgent: ctx?.userAgent ?? undefined,
    });
    return patient;
  }

  async findAllForNurse(nurseId: string, ctx?: AuditContext) {
    const assignments = await this.prisma.patientAssignment.findMany({
      where: {
        nurseId,
        patient: { deletedAt: null },
      },
      include: { patient: true },
      orderBy: { patient: { lastName: 'asc' } },
    });
    const patients = assignments.map((a) => a.patient);
    await this.audit.log({
      action: 'PATIENT_LIST',
      resourceType: 'Patient',
      userId: nurseId,
      ipAddress: ctx?.ipAddress ?? undefined,
      userAgent: ctx?.userAgent ?? undefined,
      metadata: { count: patients.length },
    });
    return patients;
  }

  async findOneForNurse(patientId: string, nurseId: string, ctx?: AuditContext) {
    const assignment = await this.prisma.patientAssignment.findFirst({
      where: { patientId, nurseId },
      include: { patient: true },
    });
    if (!assignment) throw new NotFoundException('Patient non trouvé.');
    if (assignment.patient.deletedAt) throw new NotFoundException('Patient non trouvé.');
    await this.audit.log({
      action: 'PATIENT_VIEW',
      resourceType: 'Patient',
      resourceId: patientId,
      userId: nurseId,
      ipAddress: ctx?.ipAddress ?? undefined,
      userAgent: ctx?.userAgent ?? undefined,
    });
    return assignment.patient;
  }

  async update(patientId: string, nurseId: string, dto: UpdatePatientDto, ctx?: AuditContext) {
    const assignment = await this.prisma.patientAssignment.findFirst({
      where: { patientId, nurseId },
      include: { patient: true },
    });
    if (!assignment) throw new NotFoundException('Patient non trouvé.');
    if (assignment.patient.deletedAt) throw new NotFoundException('Patient non trouvé.');

    const data: Record<string, unknown> = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.birthDate !== undefined) data.birthDate = new Date(dto.birthDate);
    if (dto.ssn !== undefined) data.ssn = dto.ssn ?? null;
    if (dto.phone !== undefined) data.phone = dto.phone ?? null;
    if (dto.email !== undefined) data.email = dto.email ?? null;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.postalCode !== undefined) data.postalCode = dto.postalCode;
    if (dto.latitude !== undefined) data.latitude = dto.latitude ?? null;
    if (dto.longitude !== undefined) data.longitude = dto.longitude ?? null;
    if (dto.medicalHistory !== undefined) data.medicalHistory = dto.medicalHistory ?? undefined;
    if (dto.allergies !== undefined) data.allergies = dto.allergies ?? [];
    if (dto.currentTreatments !== undefined) data.currentTreatments = dto.currentTreatments ?? undefined;
    if (dto.consentGiven !== undefined) data.consentGiven = dto.consentGiven;
    if (dto.consentDate !== undefined) data.consentDate = dto.consentDate ? new Date(dto.consentDate) : null;

    const patient = await this.prisma.patient.update({
      where: { id: patientId },
      data: data as Parameters<typeof this.prisma.patient.update>[0]['data'],
    });
    await this.audit.log({
      action: 'PATIENT_UPDATE',
      resourceType: 'Patient',
      resourceId: patientId,
      userId: nurseId,
      ipAddress: ctx?.ipAddress ?? undefined,
      userAgent: ctx?.userAgent ?? undefined,
    });
    return patient;
  }

  async softDelete(patientId: string, nurseId: string, ctx?: AuditContext) {
    const assignment = await this.prisma.patientAssignment.findFirst({
      where: { patientId, nurseId },
      include: { patient: true },
    });
    if (!assignment) throw new NotFoundException('Patient non trouvé.');
    if (assignment.patient.deletedAt) throw new NotFoundException('Patient déjà supprimé.');
    await this.prisma.patient.update({
      where: { id: patientId },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      action: 'PATIENT_SOFT_DELETE',
      resourceType: 'Patient',
      resourceId: patientId,
      userId: nurseId,
      ipAddress: ctx?.ipAddress ?? undefined,
      userAgent: ctx?.userAgent ?? undefined,
    });
  }
}
