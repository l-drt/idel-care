import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
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
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
