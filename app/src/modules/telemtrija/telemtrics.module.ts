import { Module } from "@nestjs/common";
import { telemtryController } from "./telemetrics.controller";
import { telemetryService } from "./telemetrics.service";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { OdrzavanjeModule } from "../odrzavanje/maintenance.module";
import { GPSModule } from "../gps/gps.module";
import { AlertsModule } from "../upozorenja/alerts.module";
import { notificationmodule } from "../notifikacije/notifications.module";

@Module(
    {
        imports:[RedisModule, CassandraModule,OdrzavanjeModule, GPSModule, AlertsModule, notificationmodule],
        controllers: [telemtryController],
        providers: [telemetryService],
        exports: [telemetryService]
    }
)
export class telemetryModule{}
