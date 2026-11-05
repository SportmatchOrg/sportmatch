import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { FirebaseModule } from './firebase/firebase.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MatchesModule } from './matches/matches.module';
import { SportsModule } from './sports/sports.module';
import { JoinRequestsModule } from './join-requests/join-requests.module';
import { RatingsModule } from './ratings/ratings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PushSubscriptionsModule } from './push-subscriptions/push-subscriptions.module';
import { HealthModule } from './health/health.module';
import { KpisModule } from './kpis/kpis.module';
import { ReportsModule } from './reports/reports.module';
import { RemindersModule } from './reminders/reminders.module';
import { StorageModule } from './storage/storage.module';
import { UserBlocksModule } from './user-blocks/user-blocks.module';
import { ModerationActionsModule } from './moderation-actions/moderation-actions.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    StorageModule,
    FirebaseModule,
    UsersModule,
    MatchesModule,
    SportsModule,
    JoinRequestsModule,
    RatingsModule,
    NotificationsModule,
    PushSubscriptionsModule,
    HealthModule,
    KpisModule,
    ReportsModule,
    RemindersModule,
    UserBlocksModule,
    ModerationActionsModule,
    AiModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
