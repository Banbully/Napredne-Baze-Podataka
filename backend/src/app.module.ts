import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './infrastructure/api/api.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { CassandraModule } from './infrastructure/cassandra/cassandra.module';
import { VehicleModule } from './modules/vehicles/vehicles.module';
import { telemetryModule } from './modules/telemtrija/telemtrics.module';
import { OdrzavanjeModule } from './modules/odrzavanje/maintenance.module';
import { AlertsModule } from './modules/upozorenja/alerts.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { notificationmodule } from './modules/notifikacije/notifications.module';
import { GPSModule } from './modules/gps/gps.module';

import { ServisModule } from './modules/servisi/servis.module';
import { AnalyticsModule } from './modules/analitika/analitcs.module';



@Module({
  imports: [
    ConfigModule.forRoot(),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ServisModule,
    ApiModule,
    RedisModule,
    CassandraModule,
    VehicleModule,
    OdrzavanjeModule,
    telemetryModule,
    AlertsModule,
    LeaderboardModule,
    notificationmodule,
    GPSModule,
    ServisModule,
    AnalyticsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
