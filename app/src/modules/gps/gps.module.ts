import { Module } from "@nestjs/common";
import { GPSService } from "./gps.service";
import { GPSController } from "./gps.controller";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";

@Module({
    imports:[RedisModule, CassandraModule],
    controllers:[GPSController],
    providers:[GPSService],
    exports:[GPSService]
})
export class GPSModule{}