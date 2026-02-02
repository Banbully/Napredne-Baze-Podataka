import { Module } from "@nestjs/common";
import { NotificationController } from "./notifications.controller";
import { NotificationService } from "./notifications.service";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";

@Module({
    imports:[RedisModule, CassandraModule],
    controllers:[NotificationController],
    providers:[NotificationService],
    exports:[NotificationService]
})
export class notificationmodule{}
