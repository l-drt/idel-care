import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { CareActivitiesModule } from './modules/care-activities/care-activities.module';
import { TransmissionsModule } from './modules/transmissions/transmissions.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ToursModule } from './modules/tours/tours.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    PatientsModule,
    VitalsModule,
    CareActivitiesModule,
    TransmissionsModule,
    MessagesModule,
    ToursModule,
    DocumentsModule,
    AuditModule,
  ],
})
export class AppModule {}
