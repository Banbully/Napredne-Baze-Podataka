import { Module } from "@nestjs/common";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { VehicleModule } from "../vehicles/vehicles.module";
import { ServisService } from "./servis.service";
import { ServisController } from "./servis.controller";

@Module({
    imports:[RedisModule, CassandraModule, VehicleModule],
    controllers: [ServisController],
    providers:[ServisService],
    exports:[ServisService],
})
export class ServisModule{}
