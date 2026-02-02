import { Module } from "@nestjs/common";
import { LeaderboardController } from "./leaderboard.controller";
import { LeaderboardService } from "./leaderboard.service";
import { RedisModule } from "src/infrastructure/redis/redis.module";
import { CassandraModule } from "src/infrastructure/cassandra/cassandra.module";

@Module({
    imports:[RedisModule,CassandraModule],
    controllers: [LeaderboardController],
    providers:[LeaderboardService],
    exports:[LeaderboardService],
})
export class LeaderboardModule{}