import { Injectable } from "@nestjs/common";
import RedisClient from "@redis/client/dist/lib/client";
import { CassandraService } from "src/infrastructure/cassandra/cassandra.service";

import { RedisService } from "src/infrastructure/redis/redis.service";

@Injectable()
export class LeaderboardService{

    constructor(private readonly red:RedisService, private readonly cass: CassandraService){}

    leaderboardBrzina()
    {
         return this.vratiVozila("leaderboard:speed",5)
    }
    leaderboardOdometar()
    {
         return this.vratiVozila("leaderboard:odometar",5)
    }
    
    leaderboardGorivo()
    {
         return this.vratiVozila("leaderboard:fuel", 5)
    }
    
    leaderboardTemperatura()
    {
         return this.vratiVozila("leaderboard:temp", 5)
    }
    
    leaderboardObrtaji()
    {
          return this.vratiVozila("leaderboard:engineRpm", 5)
    }

    async updateLeaderboard(deviceId: string, data:any)
    {
        if(data.sensors?.speed && data.sensors?.speed > 0) {
            await this.red.zAdd(`leaderboard:speed`, data.sensors?.speed, deviceId );
        }
        else if (data.sensors?.odometar && data.sensors?.odometar > 0) {
            await this.red.zAdd(`leaderboard:odmetar`, data.sensors?.odometar, deviceId );
        }
        else if (data.sensors?.temp && data.sensors?.temp > 0) {
            await this.red.zAdd(`leaderboard:temp`, data.sensors?.temp, deviceId );
        }
        else if (data.sensors?.engineRpm && data.sensors?.engineRpm> 0) {
            await this.red.zAdd(`leaderboard:engineRpm`, data.sensors?.engineRpm, deviceId );
        }
        else (data.sensors?.fuelLevel && data.sensors?.fuelLevel > 0)
        {
            await this.red.zAdd(`leaderboard:fuel`, data.sensors?.fuelLevel, deviceId );
        }
    }


    async resetUTabeli(parametar:string,deviceId:string, daily:boolean)
    {
        const dan = new Date().toISOString().slice(0,10)
        if(daily)
        {
            await this.red.zAdd(`leaderboard:${parametar}:${dan}`,0, deviceId)    
        }
        await this.red.zAdd(`leaderboard:${parametar}`,0, deviceId)
    }


    
    async updateLeaderboardOdometar(deviceId: string, data:any,daily:boolean)
    {
        const odometar = data.sensors?.odometar || 0;
        const dan = new Date().toISOString().slice(0,10)
        if(daily && odometar>0)
        {
             await this.red.zAdd(`leaderboard:odometar:${dan}`, odometar, deviceId );   
        }
        if (odometar > 0) {
            await this.red.zAdd(`leaderboard:odometar`, odometar, deviceId );
        }
    }
    async updateLeaderboardFuel(deviceId: string, data:any, daily:boolean)
    {
        const fuel = data.sensors?.fuel || 0;
        const dan = new Date().toISOString().slice(0,10)
        if(daily && fuel>0)
        {
             await this.red.zAdd(`leaderboard:fuel:${dan}`, fuel, deviceId );   
        }
        if (fuel > 0) {
            await this.red.zAdd(`leaderboard:fuel`, fuel, deviceId );
        }
    }
    async updateLeaderboardengineRPM(deviceId: string, data:any,daily:boolean)
    {
        const engineRPM = data.sensors?.enginerpm || 0;
        const dan = new Date().toISOString().slice(0,10)
        if(daily && engineRPM>0)
        {
             await this.red.zAdd(`leaderboard:engineRpm:${dan}`, engineRPM, deviceId );   
        }
        if (engineRPM > 0) {
            await this.red.zAdd(`leaderboard:engineRpm`, engineRPM, deviceId );
        }
    }
    async updateLeaderboardTemp(deviceId: string, data:any, daily:boolean)
    {
        const temp = data.sensors?.temp || 0;
        if (temp > 0) {
            await this.red.zAdd(`leaderboard:odometar`, temp, deviceId );
        }
    }

    async getHelthScoreLeaderboard()
    {
        return await this.vratiVozila(`leaderboard:healthScore`, 5)
    }

    async updateHealthScore(deviceId: string, data:any,daily:boolean)
    {
        const engineRPM = data.sensors?.enginerpm || 0;
        if (engineRPM > 0) {
            await this.red.zAdd(`leaderboard:engineRpm`, engineRPM, deviceId );
        }
    }
    
    async vratiVozila(key:string,limit=5)
    {
        const ranglista=await this.red.zTop(key,limit);

        const tabela:any[]=[]

        for(const r of ranglista)
        {
            const deviceId=r.value;
            const res= this.cass.execute(
                `SELECT marka, model FROM vozila WHERE deviceId=?`,
                [
                    r.value
                ],
            )
            
            const value= (await res).rows[0];
            tabela.push({marka:value.marka, model:value.model})

        }
        return tabela
    }

    async resetDailyLeaderboardove(key:string)
    {
        const keys= await this.red.keys(key)
        for(const k of keys)
        {
            await this.red.del(k);
        }
    }



    async iizbaciIzTabele(parametar:string, deviceId: string, daily:boolean)
    {
        const dan= new Date().toISOString().slice(0,10)
        if(daily)
        {
            await this.red.zRem(`leaderboard:${parametar}:${dan}`,deviceId)
        }
        else
            await this.red.zRem(`leaderboard:${parametar}`, deviceId);
    }

    async ubaciUDailyLeaderboard(key:string, score:number, deviceId: string)
    {
        const dan= new Date().toISOString().slice(0,10)
        const redisKey= `${key}:${dan}`
        await this.red.zAdd(redisKey, score, deviceId)
        await this.red.expire(redisKey, 60*60*24*7);
    }
    async ObrisiTabelu(parametar:string)
    {
        await this.red.del(`leaderboard:${parametar}`)
        return {ok: true}
    }

    async OcistiDnevnuTabelu(parametar:string)
    {
        const dan= new Date().toISOString().slice(0,10)
        const redisKey= `leaderboard:${parametar}:${dan}`
        await this.red.del(redisKey)
        await this.red.expire(redisKey, 60*60*24*7)
    }

    async OcistiDnevneTabele()
    {
        const dan= new Date().toISOString().slice(0,10)
        await Promise.all([
            await this.red.del(`leaderboard:odometar:${dan}`),
            await this.red.del(`leaderboard:temp:${dan}`),
            await this.red.del(`leaderboard:engineRpm:${dan}`),
            await this.red.del(`leaderboard:speed:${dan}`),
            await this.red.del(`leaderboard:fuel:${dan}`)
        ])
    }



}