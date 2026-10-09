import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
