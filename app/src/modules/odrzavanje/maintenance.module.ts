import { Module } from "@nestjs/common";
import { OdrzavanjeController } from "./maintenance.controller";
import { OdrzavanjeService } from "./maintenance.service";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";

@Module(
    {
        imports:[RedisModule, CassandraModule],
        controllers: [OdrzavanjeController],
        providers: [OdrzavanjeService],
        exports: [OdrzavanjeService]
    }
)
export class OdrzavanjeModule{}
