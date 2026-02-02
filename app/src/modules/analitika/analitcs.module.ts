import { Module } from "@nestjs/common";
import { AnalyticsService } from "./analitics.service";
import { AnalyticsController } from "./analitics.controller";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";

import { RedisModule } from "src/infrastructure/redis/redis.module";

@Module({
    imports:[CassandraModule, RedisModule],
    controllers:[AnalyticsController],
    providers:[AnalyticsService],
    exports:[AnalyticsService]
})
export class AnalyticsModule{}