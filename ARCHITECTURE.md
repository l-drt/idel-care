# 🏗️ ARCHITECTURE TECHNIQUE - SaaS IDEL

**Projet** : Application SaaS de suivi patient pour infirmiers libéraux  
**Conformité** : HDS + RGPD obligatoire  
**Stack** : Expo (React Native) + Node.js + PostgreSQL  

---

## 📋 TABLE DES MATIÈRES

1. [Stack Technique](#stack-technique)
2. [Architecture Globale](#architecture-globale)
3. [Infrastructure HDS](#infrastructure-hds)
4. [Structure du Projet](#structure-du-projet)
5. [Base de Données](#base-de-données)
6. [API Backend](#api-backend)
7. [Application Mobile](#application-mobile)
8. [Authentification & Sécurité](#authentification--sécurité)
9. [Fonctionnalités par Phase](#fonctionnalités-par-phase)
10. [Guide d'Implémentation](#guide-dimplémentation)

---

## 🎯 STACK TECHNIQUE

### Frontend Mobile
```yaml
Framework: Expo (React Native)
Langage: TypeScript
Navigation: expo-router (file-based routing)
State Management: Zustand
UI Library: React Native Paper (Material Design)
Charts: react-native-chart-kit
Maps: react-native-maps + Mapbox
HTTP Client: axios + @tanstack/react-query
Real-time: Socket.io-client
Storage Local: expo-secure-store (chiffrement natif)
```

### Backend API
```yaml
Framework: NestJS (Node.js + TypeScript)
Architecture: Modular Monolith (prêt pour microservices)
ORM: Prisma
Validation: class-validator + class-transformer
Auth: Passport.js + JWT + TOTP (2FA)
Real-time: Socket.io
Documentation: Swagger (OpenAPI 3.0)
Queue: BullMQ + Redis (tâches asynchrones)
```

### Base de Données & Stockage
```yaml
Database: PostgreSQL 16 (OVHcloud Managed Database HDS)
Cache: Redis 7 (sessions + pub/sub)
Object Storage: OVHcloud Object Storage HDS (S3-compatible)
Backup: Automated daily (OVHcloud Backup HDS)
```

### Infrastructure & DevOps
```yaml
Hébergement: OVHcloud (certifié HDS)
  - Backend: VPS HDS ou Managed Kubernetes
  - Database: PostgreSQL HDS Managed
  - Storage: Object Storage HDS

CI/CD: GitHub Actions
Containers: Docker + Docker Compose
Monitoring: Sentry (erreurs) + Better Stack (logs)
SSL/TLS: Let's Encrypt (auto-renew)
```

### Services Externes
```yaml
Cartographie: Mapbox (optimisation tournées)
Email: Brevo (ex-Sendinblue, français, RGPD)
SMS 2FA: OVH SMS API (français, HDS-compatible)
Push Notifications: Expo Push Notifications (gratuit)
```

---

## 🏛️ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE FRONTEND                          │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   Mobile App (Expo)  │    │   Web Admin (Next.js)│      │
│  │   iOS + Android      │    │   Dashboard          │      │
│  └──────────┬───────────┘    └──────────┬───────────┘      │
└─────────────┼──────────────────────────┼───────────────────┘
              │ HTTPS/TLS 1.3            │
              ↓                          ↓
┌─────────────────────────────────────────────────────────────┐
│              HÉBERGEMENT OVHcloud HDS                       │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │          API GATEWAY (Nginx/Traefik)        │           │
│  │  • Rate limiting (1000 req/h par user)      │           │
│  │  • CORS configuration                       │           │
│  │  • Logging audit (obligatoire HDS)          │           │
│  └────────────────┬────────────────────────────┘           │
│                   ↓                                         │
│  ┌─────────────────────────────────────────────┐           │
│  │         BACKEND API (NestJS)                │           │
│  │  ┌──────────┬──────────┬──────────┬──────┐ │           │
│  │  │  Auth    │ Patients │  Vitals  │ Tours│ │           │
│  │  │  Module  │  Module  │  Module  │Module│ │           │
│  │  └──────────┴──────────┴──────────┴──────┘ │           │
│  │                                             │           │
│  │  ┌──────────────────────────────────────┐  │           │
│  │  │     Socket.io Server (Real-time)     │  │           │
│  │  │  • Messagerie instantanée            │  │           │
│  │  │  • Notifications temps réel          │  │           │
│  │  └──────────────────────────────────────┘  │           │
│  └────────────────┬────────────────────────────┘           │
│                   ↓                                         │
│  ┌─────────────────────────────────────────────┐           │
│  │         DONNÉES (Layer Persistance)         │           │
│  │  ┌────────────────┬─────────────────────┐  │           │
│  │  │  PostgreSQL    │      Redis          │  │           │
│  │  │  HDS Managed   │   (Cache/Sessions)  │  │           │
│  │  │  • Chiffré AES │   • Pub/Sub         │  │           │
│  │  │  • Backup auto │   • Queue jobs      │  │           │
│  │  └────────────────┴─────────────────────┘  │           │
│  │                                             │           │
│  │  ┌──────────────────────────────────────┐  │           │
│  │  │    Object Storage HDS (Documents)    │  │           │
│  │  │  • Ordonnances (PDF chiffrés)        │  │           │
│  │  │  • Comptes-rendus                    │  │           │
│  │  │  • Photos de soins                   │  │           │
│  │  └──────────────────────────────────────┘  │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
│  ┌─────────────────────────────────────────────┐           │
│  │         SERVICES MONITORING                 │           │
│  │  • Sentry (erreurs applicatives)            │           │
│  │  • Better Stack (logs centralisés)          │           │
│  │  • OVHcloud Metrics (infra)                 │           │
│  └─────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              SERVICES EXTERNES (APIs)                       │
│  • Mapbox (cartographie + optimisation)                     │
│  • Brevo (emails transactionnels)                           │
│  • OVH SMS (codes 2FA)                                      │
│  • Expo Push (notifications mobile)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏢 INFRASTRUCTURE HDS (OVHcloud)

### Configuration Recommandée

#### Environnement de Production
```yaml
Backend API:
  Type: VPS HDS Cloud
  Specs: 4 vCPU, 16 GB RAM, 100 GB SSD
  OS: Ubuntu 22.04 LTS
  Coût: ~350€/mois

Database:
  Type: PostgreSQL Managed Database HDS
  Version: PostgreSQL 16
  Plan: Business (HA + backup auto)
  Specs: 4 vCPU, 16 GB RAM, 200 GB Storage
  Coût: ~280€/mois

Redis:
  Type: Redis Managed HDS
  Version: Redis 7
  Plan: Essential
  Coût: ~40€/mois

Object Storage:
  Type: Object Storage HDS (S3-compatible)
  Région: GRA (Gravelines, France)
  Storage: 500 GB initiaux
  Coût: ~50€/mois (+ trafic)

Load Balancer:
  Type: OVHcloud Load Balancer
  SSL: Let's Encrypt automatique
  Coût: ~25€/mois

TOTAL INFRASTRUCTURE: ~745€/mois
```

#### Environnement de Développement
```yaml
Backend: Docker Compose local
Database: PostgreSQL local (Docker)
Redis: Redis local (Docker)
Storage: MinIO local (S3-compatible)

TOTAL: 0€ (développement local)
```

### URLs & Endpoints
```
Production:
  API: https://api.idel-care.fr
  Web Admin: https://admin.idel-care.fr
  Object Storage: https://storage.idel-care.fr

Staging:
  API: https://api-staging.idel-care.fr
```

---

## 📁 STRUCTURE DU PROJET

### Monorepo (recommandé)
```
idel-care/
├── apps/
│   ├── mobile/                 # Application Expo
│   │   ├── app/                # Expo Router (file-based)
│   │   │   ├── (auth)/
│   │   │   │   ├── login.tsx
│   │   │   │   └── setup-2fa.tsx
│   │   │   ├── (tabs)/
│   │   │   │   ├── patients.tsx
│   │   │   │   ├── tours.tsx
│   │   │   │   └── messages.tsx
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   ├── services/           # API clients
│   │   ├── stores/             # Zustand stores
│   │   ├── types/
│   │   ├── app.json
│   │   └── package.json
│   │
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   │   └── totp.strategy.ts
│   │   │   │   │   └── guards/
│   │   │   │   ├── patients/
│   │   │   │   │   ├── patients.controller.ts
│   │   │   │   │   ├── patients.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── vitals/
│   │   │   │   ├── care-activities/
│   │   │   │   ├── transmissions/
│   │   │   │   ├── messages/
│   │   │   │   ├── tours/
│   │   │   │   ├── documents/
│   │   │   │   └── audit/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   └── middleware/
│   │   │   ├── database/
│   │   │   │   └── prisma/
│   │   │   │       └── schema.prisma
│   │   │   ├── config/
│   │   │   ├── main.ts
│   │   │   └── app.module.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── package.json
│   │
│   └── web-admin/              # Dashboard Next.js (Phase 2)
│       └── (à créer)
│
├── packages/                   # Code partagé
│   ├── types/                  # Types TypeScript communs
│   │   ├── patient.types.ts
│   │   ├── vital.types.ts
│   │   └── index.ts
│   └── utils/                  # Fonctions utilitaires
│       └── date-helpers.ts
│
├── docs/
│   ├── API.md                  # Documentation API
│   ├── DEPLOYMENT.md           # Guide déploiement
│   └── HDS-COMPLIANCE.md       # Checklist conformité
│
├── .github/
│   └── workflows/
│       ├── ci-mobile.yml
│       └── ci-api.yml
│
├── docker-compose.yml          # Dev local
├── .gitignore
├── README.md
└── ARCHITECTURE.md             # Ce fichier
```

---

## 🗄️ BASE DE DONNÉES (PostgreSQL)

### Schéma Prisma (apps/api/src/database/prisma/schema.prisma)

```prisma
// This is your Prisma schema file
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ENUMS
enum UserRole {
  NURSE           // Infirmier libéral
  PRESCRIBER      // Médecin prescripteur
  PROVIDER        // Prestataire
  ADMIN           // Admin cabinet
}

enum CareType {
  WOUND_CARE
  INJECTION
  BLOOD_TEST
  MEDICATION
  TOILETTE
  OTHER
}

enum DocumentType {
  PRESCRIPTION
  MEDICAL_REPORT
  LAB_RESULT
  PHOTO
  OTHER
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
}

// MODÈLES

model User {
  id                String    @id @default(uuid())
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Identité
  email             String    @unique
  passwordHash      String
  firstName         String
  lastName          String
  phone             String?
  role              UserRole

  // 2FA (TOTP)
  totpSecret        String?
  totpEnabled       Boolean   @default(false)
  totpVerifiedAt    DateTime?

  // Métadonnées
  lastLoginAt       DateTime?
  lastLoginIp       String?
  isActive          Boolean   @default(true)

  // Relations
  patientsAssigned  PatientAssignment[]
  vitalsRecorded    VitalSign[]
  careActivities    CareActivity[]
  transmissions     Transmission[]
  messagesSent      Message[]
  tours             Tour[]
  documentsUploaded Document[]
  auditLogs         AuditLog[]
  refreshTokens     RefreshToken[]

  @@map("users")
}

model RefreshToken {
  id          String   @id @default(uuid())
  token       String   @unique
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@map("refresh_tokens")
}

model Patient {
  id              String    @id @default(uuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Identité (données sensibles)
  firstName       String
  lastName        String
  birthDate       DateTime
  ssn             String?   // Numéro sécu (chiffré au niveau app)

  // Contact
  phone           String?
  email           String?
  address         String
  city            String
  postalCode      String
  latitude        Float?    // Pour cartographie
  longitude       Float?

  // Médical
  medicalHistory  Json?     // ATCD structurés
  allergies       String[]
  currentTreatments Json?   // [{name, dosage, frequency}]

  // Consentement RGPD
  consentGiven    Boolean   @default(false)
  consentDate     DateTime?

  // Soft delete
  deletedAt       DateTime?

  // Relations
  assignments     PatientAssignment[]
  vitalSigns      VitalSign[]
  careActivities  CareActivity[]
  transmissions   Transmission[]
  documents       Document[]
  tourStops       TourStop[]

  @@map("patients")
}

model PatientAssignment {
  id          String   @id @default(uuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  nurseId     String
  nurse       User     @relation(fields: [nurseId], references: [id])
  assignedAt  DateTime @default(now())
  isActive    Boolean  @default(true)

  @@unique([patientId, nurseId])
  @@map("patient_assignments")
}

model VitalSign {
  id                      String   @id @default(uuid())
  patientId               String
  patient                 Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  recordedById            String
  recordedBy              User     @relation(fields: [recordedById], references: [id])
  recordedAt              DateTime @default(now())

  // Constantes
  bloodPressureSystolic   Int?
  bloodPressureDiastolic  Int?
  heartRate               Int?
  temperature             Float?
  spo2                    Int?     // Saturation oxygène
  glucose                 Float?   // Glycémie
  weight                  Float?

  // Alertes automatiques
  isAbnormal              Boolean  @default(false)
  alertMessage            String?

  @@index([patientId, recordedAt])
  @@map("vital_signs")
}

model CareActivity {
  id              String      @id @default(uuid())
  patientId       String
  patient         Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  nurseId         String
  nurse           User        @relation(fields: [nurseId], references: [id])

  scheduledAt     DateTime
  completedAt     DateTime?

  careType        CareType
  checklist       Json?       // [{item: "Nettoyage plaie", done: true}]
  notes           String?

  // Traçabilité (obligatoire HDS)
  signature       String      // Hash du soignant + timestamp

  @@index([nurseId, scheduledAt])
  @@index([patientId, scheduledAt])
  @@map("care_activities")
}

model Transmission {
  id          String   @id @default(uuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())

  content     String
  isUrgent    Boolean  @default(false)

  // Signature numérique (traçabilité)
  signature   Json     // {name, role, timestamp, hash}

  @@index([patientId, createdAt])
  @@map("transmissions")
}

model Message {
  id              String        @id @default(uuid())
  senderId        String
  sender          User          @relation(fields: [senderId], references: [id])
  conversationId  String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  content         String
  status          MessageStatus @default(SENT)

  createdAt       DateTime      @default(now())
  readAt          DateTime?

  @@index([conversationId, createdAt])
  @@map("messages")
}

model Conversation {
  id            String    @id @default(uuid())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Participants (JSON pour flexibilité)
  participantIds String[] // Array de User IDs

  lastMessageAt  DateTime?

  messages      Message[]

  @@map("conversations")
}

model Tour {
  id                      String     @id @default(uuid())
  nurseId                 String
  nurse                   User       @relation(fields: [nurseId], references: [id])
  date                    DateTime   @db.Date

  // Calculs d'optimisation
  totalDistanceKm         Float?
  estimatedDurationMinutes Int?

  createdAt               DateTime   @default(now())
  updatedAt               DateTime   @updatedAt

  stops                   TourStop[]

  @@unique([nurseId, date])
  @@map("tours")
}

model TourStop {
  id              String   @id @default(uuid())
  tourId          String
  tour            Tour     @relation(fields: [tourId], references: [id], onDelete: Cascade)
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])

  visitOrder      Int      // Ordre de passage (1, 2, 3...)
  estimatedTime   String?  // Format "14:30"
  durationMinutes Int?     // Durée estimée du soin

  @@unique([tourId, visitOrder])
  @@map("tour_stops")
}

model Document {
  id              String       @id @default(uuid())
  patientId       String
  patient         Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  uploadedById    String
  uploadedBy      User         @relation(fields: [uploadedById], references: [id])
  uploadedAt      DateTime     @default(now())

  documentType    DocumentType
  fileName        String
  filePath        String       // URL Object Storage
  fileSizeBytes   BigInt
  mimeType        String

  // Chiffrement (clé stockée séparément)
  encryptionKeyId String?

  @@index([patientId, uploadedAt])
  @@map("documents")
}

model AuditLog {
  id            String   @id @default(uuid())
  userId        String?
  user          User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  action        String   // 'VIEW_PATIENT', 'UPDATE_VITALS', 'DELETE_DOCUMENT'
  resourceType  String   // 'Patient', 'VitalSign', etc.
  resourceId    String?

  ipAddress     String?
  userAgent     String?

  metadata      Json?    // Données additionnelles

  createdAt     DateTime @default(now())

  @@index([userId, createdAt])
  @@index([resourceType, resourceId])
  @@map("audit_logs")
}
```

### Migrations Prisma

```bash
# Créer une migration
npx prisma migrate dev --name init

# Appliquer en production
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

---

## 🔌 API BACKEND (NestJS)

### Configuration Principale (apps/api/src/main.ts)

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'],
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('IDEL Care API')
    .setDescription('API SaaS suivi patient infirmiers libéraux')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification et 2FA')
    .addTag('patients', 'Gestion des patients')
    .addTag('vitals', 'Constantes vitales')
    .addTag('care-activities', 'Activités de soins')
    .addTag('transmissions', 'Transmissions ciblées')
    .addTag('messages', 'Messagerie sécurisée')
    .addTag('tours', 'Gestion des tournées')
    .addTag('documents', 'Documents médicaux')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
```

### Module Auth (apps/api/src/modules/auth/auth.controller.ts)

```typescript
import { Controller, Post, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, Verify2FADto, Enable2FADto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription utilisateur (admin seulement)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Connexion (étape 1)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-2fa')
  @HttpCode(200)
  @ApiOperation({ summary: 'Vérification code 2FA (étape 2)' })
  async verify2FA(@Body() dto: Verify2FADto) {
    return this.authService.verify2FA(dto);
  }

  @Post('enable-2fa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activer 2FA (première connexion)' })
  async enable2FA(@Req() req, @Body() dto: Enable2FADto) {
    return this.authService.enable2FA(req.user.id, dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  async logout(@Req() req) {
    return this.authService.logout(req.user.id);
  }
}
```

### Service Auth avec 2FA (apps/api/src/modules/auth/auth.service.ts)

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        phone: dto.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return { user, message: 'Utilisateur créé. 2FA requis à la première connexion.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Si 2FA non activé, retourner QR code pour setup
    if (!user.totpEnabled) {
      const secret = speakeasy.generateSecret({
        name: `IDEL Care (${user.email})`,
        issuer: 'IDEL Care',
      });

      // Sauvegarder le secret temporairement
      await this.prisma.user.update({
        where: { id: user.id },
        data: { totpSecret: secret.base32 },
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      return {
        requires2FASetup: true,
        userId: user.id,
        qrCode: qrCodeUrl,
        secret: secret.base32,
      };
    }

    // Si 2FA déjà activé, demander le code
    return {
      requires2FA: true,
      userId: user.id,
    };
  }

  async verify2FA(dto: Verify2FADto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user || !user.totpSecret) {
      throw new UnauthorizedException('Utilisateur invalide');
    }

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: dto.code,
      window: 2, // Tolérance ±60 secondes
    });

    if (!verified) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: dto.ipAddress,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        resourceType: 'User',
        resourceId: user.id,
        ipAddress: dto.ipAddress,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async enable2FA(userId: string, dto: Enable2FADto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: dto.code,
    });

    if (!verified) {
      throw new UnauthorizedException('Code invalide');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpEnabled: true,
        totpVerifiedAt: new Date(),
      },
    });

    return { message: '2FA activé avec succès' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        { expiresIn: '7d' },
      ),
    ]);

    // Stocker refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    // Supprimer ancien token
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
```

### Endpoints API Complets

```typescript
// Routes principales (voir swagger pour détails)

POST   /api/auth/login                      // Connexion
POST   /api/auth/verify-2fa                 // Vérification 2FA
POST   /api/auth/refresh                    // Refresh token
POST   /api/auth/logout                     // Déconnexion

GET    /api/patients                        // Liste patients (paginée)
POST   /api/patients                        // Créer patient
GET    /api/patients/:id                    // Détails patient
PATCH  /api/patients/:id                    // Modifier patient
DELETE /api/patients/:id                    // Supprimer patient (soft)

POST   /api/vitals                          // Ajouter constante
GET    /api/vitals?patientId=&dateRange=    // Récupérer constantes
GET    /api/vitals/:id/chart                // Données pour graphique

GET    /api/care-activities?nurseId=&date=  // Liste soins
POST   /api/care-activities                 // Planifier soin
PATCH  /api/care-activities/:id/complete    // Marquer terminé

GET    /api/transmissions?patientId=        // Transmissions patient
POST   /api/transmissions                   // Créer transmission

GET    /api/messages/conversations          // Liste conversations
GET    /api/messages/:conversationId        // Messages conversation
POST   /api/messages                        // Envoyer message
WS     /socket.io                           // WebSocket real-time

GET    /api/tours?date=&nurseId=            // Tournée du jour
POST   /api/tours/optimize                  // Optimiser tournée
PATCH  /api/tours/:id/reorder               // Réorganiser manuellement

POST   /api/documents/upload                // Upload document
GET    /api/documents?patientId=            // Documents patient
GET    /api/documents/:id/download          // Télécharger
DELETE /api/documents/:id                   // Supprimer

GET    /api/audit/logs?userId=&resourceType= // Logs audit (admin)
```

---

## 📱 APPLICATION MOBILE (EXPO)

### Configuration Expo (apps/mobile/app.json)

```json
{
  "expo": {
    "name": "IDEL Care",
    "slug": "idel-care",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.idelcare.app",
      "infoPlist": {
        "NSCameraUsageDescription": "Pour prendre des photos de soins",
        "NSPhotoLibraryUsageDescription": "Pour joindre des documents",
        "NSLocationWhenInUseUsageDescription": "Pour optimiser vos tournées"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.idelcare.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Permet l'optimisation automatique de vos tournées"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

### Variables d'Environnement (apps/mobile/.env)

```env
# API
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_WS_URL=http://localhost:3000

# Mapbox
EXPO_PUBLIC_MAPBOX_TOKEN=pk.YOUR_MAPBOX_TOKEN

# Environnement
EXPO_PUBLIC_ENV=development
```

### Service API Client (apps/mobile/services/api.ts)

```typescript
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@env';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor (add auth token)
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor (handle 401, refresh token)
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            const { data } = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            await SecureStore.setItemAsync('accessToken', data.accessToken);
            await SecureStore.setItemAsync('refreshToken', data.refreshToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Redirect to login
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            // Navigate to login screen
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Auth
  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }

  async verify2FA(userId: string, code: string) {
    const { data } = await this.client.post('/auth/verify-2fa', { userId, code });

    // Store tokens
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));

    return data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
  }

  // Patients
  async getPatients(page = 1, limit = 20) {
    const { data } = await this.client.get('/patients', {
      params: { page, limit },
    });
    return data;
  }

  async getPatient(id: string) {
    const { data } = await this.client.get(`/patients/${id}`);
    return data;
  }

  async createPatient(patient: any) {
    const { data } = await this.client.post('/patients', patient);
    return data;
  }

  // Vitals
  async addVitalSign(vital: any) {
    const { data } = await this.client.post('/vitals', vital);
    return data;
  }

  async getVitalSigns(patientId: string, dateRange?: { start: string; end: string }) {
    const { data } = await this.client.get('/vitals', {
      params: { patientId, ...dateRange },
    });
    return data;
  }

  // Tours
  async getTodayTour(nurseId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await this.client.get('/tours', {
      params: { nurseId, date: today },
    });
    return data;
  }

  async optimizeTour(waypoints: Array<{ patientId: string; lat: number; lng: number }>) {
    const { data } = await this.client.post('/tours/optimize', { waypoints });
    return data;
  }

  // Messages (REST endpoints, pas WebSocket)
  async getConversations() {
    const { data } = await this.client.get('/messages/conversations');
    return data;
  }

  async sendMessage(conversationId: string, content: string) {
    const { data } = await this.client.post('/messages', { conversationId, content });
    return data;
  }
}

export default new ApiClient();
```

### Store Zustand Auth (apps/mobile/stores/authStore.ts)

```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<any>;
  verify2FA: (userId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      return response; // Retourne infos pour 2FA
    } catch (error) {
      throw error;
    }
  },

  verify2FA: async (userId: string, code: string) => {
    try {
      const data = await api.verify2FA(userId, code);
      set({ user: data.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async () => {
    try {
      const userString = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('accessToken');

      if (userString && token) {
        const user = JSON.parse(userString);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
```

### Screen Login (apps/mobile/app/(auth)/login.tsx)

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'login' | '2fa' | 'setup'>('login');
  const [loading, setLoading] = useState(false);

  const { login, verify2FA } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);

      if (response.requires2FASetup) {
        // Première connexion: afficher QR code
        setUserId(response.userId);
        setStep('setup');
        // TODO: Afficher QR code (response.qrCode)
      } else if (response.requires2FA) {
        // 2FA déjà configuré
        setUserId(response.userId);
        setStep('2fa');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('Erreur', 'Code 2FA invalide');
      return;
    }

    setLoading(true);
    try {
      await verify2FA(userId, code);
      router.replace('/(tabs)/patients');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'login') {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          IDEL Care
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Connexion sécurisée
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Se connecter
        </Button>
      </View>
    );
  }

  if (step === '2fa') {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          Code 2FA
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Entrez le code depuis votre application d'authentification
        </Text>

        <TextInput
          label="Code à 6 chiffres"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleVerify2FA}
          loading={loading}
          disabled={loading || code.length !== 6}
          style={styles.button}
        >
          Valider
        </Button>
      </View>
    );
  }

  // TODO: Écran setup 2FA avec QR code
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
});
```

### Screen Patients (apps/mobile/app/(tabs)/patients.tsx)

```typescript
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Text, FAB, Searchbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export default function PatientsScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.getPatients(),
  });

  const filteredPatients = patients?.filter((p: any) =>
    `${p.firstName} ${p.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher un patient"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/patient/${item.id}`)}
          >
            <Card.Content>
              <Text variant="titleMedium">
                {item.firstName} {item.lastName}
              </Text>
              <Text variant="bodySmall" style={styles.address}>
                {item.address}
              </Text>
              {item.allergies?.length > 0 && (
                <Text variant="bodySmall" style={styles.allergies}>
                  ⚠️ Allergies: {item.allergies.join(', ')}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
        refreshing={isLoading}
        onRefresh={refetch}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/patient/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 15,
  },
  card: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  address: {
    color: '#666',
    marginTop: 5,
  },
  allergies: {
    color: '#d32f2f',
    marginTop: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
```

---

## 🔐 AUTHENTIFICATION & SÉCURITÉ

### Checklist Conformité HDS/RGPD

```markdown
## Authentification
- [x] Mots de passe hashés (bcrypt, cost 12)
- [x] 2FA obligatoire (TOTP)
- [x] JWT avec expiration courte (15 min)
- [x] Refresh tokens sécurisés (7 jours)
- [x] Rate limiting connexion (5 tentatives/15min)

## Données
- [x] Chiffrement au repos (PostgreSQL AES-256)
- [x] Chiffrement en transit (TLS 1.3)
- [x] Documents chiffrés (Object Storage)
- [x] Pas de données sensibles en logs
- [x] Anonymisation données de test

## Audit & Traçabilité
- [x] Logs tous accès dossiers patients
- [x] Conservation logs 3 ans minimum
- [x] Horodatage toutes actions
- [x] Signatures numériques soins

## RGPD
- [x] Consentement patient obligatoire
- [x] Droit à l'oubli (soft delete)
- [x] Portabilité données (export JSON/PDF)
- [x] Minimisation données collectées
- [x] DPO identifié (si >250 employés)

## Infrastructure
- [x] Hébergement certifié HDS
- [x] Backups automatiques quotidiens
- [x] Plan de reprise activité (PRA)
- [x] Tests restauration mensuels
- [x] Monitoring 24/7

## Réseau
- [x] Firewall configuré
- [x] VPN pour accès admin
- [x] Certificat SSL/TLS valide
- [x] Protection DDoS
- [x] WAF (Web Application Firewall)
```

### Variables d'Environnement Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/idel_care?schema=public"
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="CHANGE_THIS_IN_PRODUCTION_USE_LONG_RANDOM_STRING"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# OVHcloud Object Storage (S3-compatible)
S3_ENDPOINT="https://s3.gra.io.cloud.ovh.net"
S3_REGION="gra"
S3_BUCKET="idel-care-documents"
S3_ACCESS_KEY="YOUR_ACCESS_KEY"
S3_SECRET_KEY="YOUR_SECRET_KEY"

# External Services
MAPBOX_API_KEY="pk.YOUR_MAPBOX_KEY"
BREVO_API_KEY="YOUR_BREVO_KEY"
OVH_SMS_ACCOUNT="sms-xx12345-1"
OVH_SMS_LOGIN="YOUR_LOGIN"
OVH_SMS_PASSWORD="YOUR_PASSWORD"

# Monitoring
SENTRY_DSN="https://xxx@sentry.io/xxx"
BETTER_STACK_SOURCE_TOKEN="YOUR_TOKEN"

# App
NODE_ENV="production"
PORT=3000
ALLOWED_ORIGINS="https://app.idel-care.fr,https://admin.idel-care.fr"
```

---

## 🚀 FONCTIONNALITÉS PAR PHASE

### Phase 1 (MVP - 4 mois)
**Objectif** : Application fonctionnelle pour 10 infirmiers pilotes

**Backend** :
- ✅ Infrastructure HDS (OVHcloud)
- ✅ Auth 2FA + JWT
- ✅ CRUD Patients
- ✅ Saisie constantes vitales
- ✅ Transmissions ciblées
- ✅ Audit logs automatiques

**Mobile** :
- ✅ Écrans login + 2FA
- ✅ Liste patients + détails
- ✅ Formulaire ajout constantes
- ✅ Graphiques constantes (Chart.js)
- ✅ Transmissions (texte simple)

**Livrable** : APK Android + IPA iOS en TestFlight

---

### Phase 2 (6 mois)
**Ajouts** :
- ✅ Messagerie sécurisée (Socket.io)
- ✅ Upload documents (ordonnances PDF)
- ✅ Notifications push (Expo)
- ✅ Export PDF dossier patient

**Mobile** :
- ✅ Chat temps réel
- ✅ Appareil photo + upload
- ✅ Visionneuse PDF documents

---

### Phase 3 (8 mois)
**Ajouts** :
- ✅ Cartographie tournées (Mapbox)
- ✅ Algorithme optimisation (TSP)
- ✅ Planning collaboratif équipe
- ✅ Drag & drop réorganisation

**Mobile** :
- ✅ Carte interactive patients
- ✅ Navigation GPS intégrée
- ✅ Réorganisation manuelle tournée

---

### Phase 4 (10-12 mois)
**Ajouts** :
- ✅ Dictée vocale (Google Speech-to-Text)
- ✅ Suggestions IA (GPT-4 API)
- ✅ Analytics avancées (dashboard)
- ✅ Intégration DMP

---

## 📝 GUIDE D'IMPLÉMENTATION

### Étape 1 : Setup Environnement Local (Jour 1-2)

```bash
# Cloner le repo (à créer)
git clone https://github.com/votre-org/idel-care.git
cd idel-care

# Backend
cd apps/api
npm install
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer PostgreSQL + Redis localement
docker-compose up -d

# Migrations Prisma
npx prisma migrate dev
npx prisma generate

# Lancer API
npm run start:dev
# API disponible sur http://localhost:3000

# Mobile (nouveau terminal)
cd apps/mobile
npm install
cp .env.example .env
# Éditer .env

# Lancer Expo
npx expo start
# Scanner QR code avec Expo Go
```

### Étape 2 : Infrastructure HDS (Jour 3-5)

```bash
# 1. Créer compte OVHcloud
# 2. Commander services HDS :
#    - VPS HDS Cloud
#    - PostgreSQL HDS Managed
#    - Redis HDS
#    - Object Storage HDS

# 3. Configuration VPS
ssh root@your-vps-ip
apt update && apt upgrade -y
apt install docker.io docker-compose nginx certbot -y

# 4. Cloner projet sur VPS
git clone https://github.com/votre-org/idel-care.git
cd idel-care/apps/api

# 5. Setup environnement production
nano .env.production
# Copier DATABASE_URL depuis OVHcloud

# 6. Build & run
docker-compose -f docker-compose.prod.yml up -d

# 7. SSL avec Let's Encrypt
certbot --nginx -d api.idel-care.fr
```

### Étape 3 : Tests & Validation (Jour 6-7)

```bash
# Tests unitaires backend
cd apps/api
npm run test

# Tests e2e
npm run test:e2e

# Tests mobile
cd apps/mobile
npm run test

# Scan sécurité
npm audit
docker scan idel-care-api:latest
```

### Étape 4 : Déploiement Staging (Jour 8-10)

```bash
# CI/CD avec GitHub Actions
# Fichier .github/workflows/deploy-staging.yml
# (Auto-déploiement sur push main)

# Build mobile staging
cd apps/mobile
eas build --profile staging --platform all
```

### Étape 5 : Audit HDS (Jour 11-15)

```markdown
1. Audit interne checklist conformité
2. Tests pénétration (externe)
3. Rapport conformité RGPD
4. Documentation technique complète
5. Formation équipe sécurité
```

---

## 📚 RESSOURCES & DOCUMENTATION

### Documentation Technique
- **NestJS** : https://docs.nestjs.com
- **Prisma** : https://www.prisma.io/docs
- **Expo** : https://docs.expo.dev
- **React Native Paper** : https://callstack.github.io/react-native-paper

### Conformité HDS
- **Liste hébergeurs HDS** : https://esante.gouv.fr/offres-services/hds
- **Guide HDS ANS** : https://esante.gouv.fr/sites/default/files/media_entity/documents/Guide-HDS.pdf
- **RGPD CNIL** : https://www.cnil.fr/fr/reglement-europeen-protection-donnees

### APIs Externes
- **Mapbox** : https://docs.mapbox.com
- **Brevo** : https://developers.brevo.com
- **OVH SMS** : https://docs.ovh.com/fr/sms

---

## 🎯 COMMANDES CURSOR RECOMMANDÉES

Ajoutez ces prompts dans Cursor pour assistance :

```
@ARCHITECTURE.md Crée le contrôleur NestJS pour [module]

@ARCHITECTURE.md Génère le store Zustand pour [feature]

@ARCHITECTURE.md Écris le test unitaire pour [service]

@ARCHITECTURE.md Implémente la migration Prisma pour [table]

@ARCHITECTURE.md Crée le screen Expo pour [fonctionnalité]
```

---

## 🔄 MAINTENANCE & MONITORING

### Checklist Hebdomadaire
- [ ] Vérifier logs erreurs (Sentry)
- [ ] Monitoring uptime (>99.5%)
- [ ] Espace disque disponible
- [ ] Tests restauration backup
- [ ] Mise à jour dépendances critiques

### Checklist Mensuelle
- [ ] Audit logs accès HDS
- [ ] Renouvellement certificats SSL
- [ ] Revue incidents sécurité
- [ ] Optimisation requêtes BDD
- [ ] Nettoyage données temporaires

---

## 📞 CONTACTS & SUPPORT

**Équipe Technique** :
- Lead Dev Backend : [nom]
- Lead Dev Mobile : [nom]
- DevOps : [nom]

**Support OVHcloud HDS** :
- Téléphone : +33 9 72 10 10 07
- Email : support@ovhcloud.com

**DPO (Data Protection Officer)** :
- Email : dpo@idel-care.fr

---

## 📄 LICENCE & CONFIDENTIALITÉ

⚠️ **CONFIDENTIEL - USAGE INTERNE UNIQUEMENT**

Ce document contient des informations techniques sensibles sur l'architecture de l'application IDEL Care. Il ne doit pas être diffusé en dehors de l'équipe de développement sans autorisation explicite.

---

**Dernière mise à jour** : 12 février 2026  
**Version** : 1.0.0  
**Auteur** : Selamat Consult
