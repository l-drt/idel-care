import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatientDto, nurseId: string) {
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
    return patient;
  }

  async findAllForNurse(nurseId: string) {
    const assignments = await this.prisma.patientAssignment.findMany({
      where: { nurseId },
      include: { patient: true },
      orderBy: { patient: { lastName: 'asc' } },
    });
    return assignments.map((a) => a.patient);
  }
}
