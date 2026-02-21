
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  email: 'email',
  passwordHash: 'passwordHash',
  firstName: 'firstName',
  lastName: 'lastName',
  phone: 'phone',
  role: 'role',
  totpSecret: 'totpSecret',
  totpEnabled: 'totpEnabled',
  totpVerifiedAt: 'totpVerifiedAt',
  twoFactorMethod: 'twoFactorMethod',
  lastLoginAt: 'lastLoginAt',
  lastLoginIp: 'lastLoginIp',
  isActive: 'isActive'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.OneTimeCodeScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  code: 'code',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.PatientScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  firstName: 'firstName',
  lastName: 'lastName',
  birthDate: 'birthDate',
  ssn: 'ssn',
  phone: 'phone',
  email: 'email',
  address: 'address',
  city: 'city',
  postalCode: 'postalCode',
  latitude: 'latitude',
  longitude: 'longitude',
  medicalHistory: 'medicalHistory',
  allergies: 'allergies',
  currentTreatments: 'currentTreatments',
  consentGiven: 'consentGiven',
  consentDate: 'consentDate',
  deletedAt: 'deletedAt'
};

exports.Prisma.PatientAssignmentScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  nurseId: 'nurseId',
  assignedAt: 'assignedAt',
  isActive: 'isActive'
};

exports.Prisma.VitalSignScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  recordedById: 'recordedById',
  recordedAt: 'recordedAt',
  bloodPressureSystolic: 'bloodPressureSystolic',
  bloodPressureDiastolic: 'bloodPressureDiastolic',
  heartRate: 'heartRate',
  temperature: 'temperature',
  spo2: 'spo2',
  glucose: 'glucose',
  weight: 'weight',
  isAbnormal: 'isAbnormal',
  alertMessage: 'alertMessage'
};

exports.Prisma.CareActivityScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  nurseId: 'nurseId',
  scheduledAt: 'scheduledAt',
  completedAt: 'completedAt',
  careType: 'careType',
  checklist: 'checklist',
  notes: 'notes',
  signature: 'signature'
};

exports.Prisma.TransmissionScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  authorId: 'authorId',
  createdAt: 'createdAt',
  content: 'content',
  isUrgent: 'isUrgent',
  signature: 'signature'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  participantIds: 'participantIds',
  lastMessageAt: 'lastMessageAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  conversationId: 'conversationId',
  content: 'content',
  status: 'status',
  createdAt: 'createdAt',
  readAt: 'readAt'
};

exports.Prisma.TourScalarFieldEnum = {
  id: 'id',
  nurseId: 'nurseId',
  date: 'date',
  totalDistanceKm: 'totalDistanceKm',
  estimatedDurationMinutes: 'estimatedDurationMinutes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TourStopScalarFieldEnum = {
  id: 'id',
  tourId: 'tourId',
  patientId: 'patientId',
  visitOrder: 'visitOrder',
  estimatedTime: 'estimatedTime',
  durationMinutes: 'durationMinutes'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  uploadedById: 'uploadedById',
  uploadedAt: 'uploadedAt',
  documentType: 'documentType',
  fileName: 'fileName',
  filePath: 'filePath',
  fileSizeBytes: 'fileSizeBytes',
  mimeType: 'mimeType',
  encryptionKeyId: 'encryptionKeyId'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  resourceType: 'resourceType',
  resourceId: 'resourceId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  NURSE: 'NURSE',
  PRESCRIBER: 'PRESCRIBER',
  PROVIDER: 'PROVIDER',
  ADMIN: 'ADMIN'
};

exports.TwoFactorMethod = exports.$Enums.TwoFactorMethod = {
  TOTP: 'TOTP',
  SMS: 'SMS',
  EMAIL: 'EMAIL'
};

exports.CareType = exports.$Enums.CareType = {
  WOUND_CARE: 'WOUND_CARE',
  INJECTION: 'INJECTION',
  BLOOD_TEST: 'BLOOD_TEST',
  MEDICATION: 'MEDICATION',
  TOILETTE: 'TOILETTE',
  OTHER: 'OTHER'
};

exports.MessageStatus = exports.$Enums.MessageStatus = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ'
};

exports.DocumentType = exports.$Enums.DocumentType = {
  PRESCRIPTION: 'PRESCRIPTION',
  MEDICAL_REPORT: 'MEDICAL_REPORT',
  LAB_RESULT: 'LAB_RESULT',
  PHOTO: 'PHOTO',
  OTHER: 'OTHER'
};

exports.Prisma.ModelName = {
  User: 'User',
  RefreshToken: 'RefreshToken',
  OneTimeCode: 'OneTimeCode',
  Patient: 'Patient',
  PatientAssignment: 'PatientAssignment',
  VitalSign: 'VitalSign',
  CareActivity: 'CareActivity',
  Transmission: 'Transmission',
  Conversation: 'Conversation',
  Message: 'Message',
  Tour: 'Tour',
  TourStop: 'TourStop',
  Document: 'Document',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
