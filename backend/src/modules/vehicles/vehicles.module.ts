import { Module } from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { VehicleController } from "./vehicles.controller";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { ApiModule } from "src/infrastructure/api/api.module";
import { telemetryModule } from "../telemtrija/telemtrics.module";

@Module({
    imports:[CassandraModule, RedisModule,ApiModule,telemetryModule],
    controllers:[VehicleController],
    providers: [VehicleService],
    exports: [VehicleService]
})
export class VehicleModule{}
