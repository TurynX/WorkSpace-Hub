import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './lib/prisma/prisma.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { BullModule } from '@nestjs/bullmq';
import { AttachmentModule } from './attachment/attachment.module';
import { ReportModule } from './report/report.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        db: process.env.REDIS_DB,
      },
    }),
    AuthModule,
    PrismaModule,
    WorkspaceModule,
    ProjectModule,
    TaskModule,
    AttachmentModule,
    ReportModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
