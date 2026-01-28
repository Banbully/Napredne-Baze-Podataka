import { Injectable } from "@nestjs/common";
import RedisClient from "@redis/client/dist/lib/client";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";

import { RedisService } from "src/infrastructure/redis/redis.service";

@Injectable()
export class LeaderboardService{

    constructor(private readonly red:RedisService, private readonly cass: CassandraService){}

    leaderboardBrzina()
    {
         return this.vratiVozilo("leaderboard:speed",5)
    }
    leaderboardOdometar()
    {
         return this.vratiVozilo("leaderboard:odometar",5)
    }
    
    leaderboardGorivo()
    {
         return this.vratiVozilo("leaderboard:fuel", 5)
    }
    
    leaderboardTemperatura()
    {
         return this.vratiVozilo("leaderboard:temp", 5)
    }
    
    leaderboardObrtaji()
    {
          return this.vratiVozilo("leaderboard:engineRpm", 5)
    }

    async vratiVozilo(key:string,limit=5)
    {
        const ranglista=await this.red.zTop(key,limit);

        const tabela:any[]=[]

        for(const r of ranglista)
        {
            const deviceId=r.value;
            const res= this.cass.execute(
                `SELECT marka, model FROM vozila WHERE deviceId=?`
                ,
                [
                    r.value
                ],
            )
            
            const value= (await res).rows[0];
            tabela.push({marka:value.marka, model:value.model})

        }
        return tabela
    }
}