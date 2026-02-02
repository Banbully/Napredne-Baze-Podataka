import { Module } from "@nestjs/common";
import { AlertsService } from "./alerts.service";
import { AlertsController } from "./alerts.controller";
import { notificationmodule } from "../notifikacije/notifications.module";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";
import { RedisModule } from "src/infrastructure/redis/redis.module";

@Module
({
    imports: [notificationmodule, CassandraModule, RedisModule],
    controllers: [AlertsController],
    providers: [AlertsService],
    exports: [AlertsService],
})
export class AlertsModule{}