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
        if(data.speed && data.speed > 0) {
            await this.red.zAdd(`leaderboard:speed`, data.speed, deviceId );
        }
        if (data.odometar && data.odometar > 0) {
            await this.red.zAdd(`leaderboard:odometar`, data.odometar, deviceId );
        }
        if (data.temp && data.temp > 0) {
            await this.red.zAdd(`leaderboard:temp`, data.temp, deviceId );
        }
        if (data.engineRpm && data.engineRpm> 0) {
            await this.red.zAdd(`leaderboard:engineRpm`, data.engineRpm, deviceId );
        }
        if (data.fuelLevel && data.fuelLevel > 0)
        {
            await this.red.zAdd(`leaderboard:fuel`, data.fuelLevel, deviceId );
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

    async updateLeaderboardOdometar(deviceId: string, odometar:number,daily:boolean)
    {
        const dan = new Date().toISOString().slice(0,10)
        if(daily && odometar>0)
        {
             await this.red.zAdd(`leaderboard:odometar:${dan}`, odometar, deviceId );   
        }
        if (odometar > 0) {
            await this.red.zAdd(`leaderboard:odometar`, odometar, deviceId );
        }
    }
    async updateLeaderboardFuel(deviceId: string, fuel:number, daily:boolean)
    {
        const dan = new Date().toISOString().slice(0,10)
        if(daily && fuel>0)
        {
             await this.red.zAdd(`leaderboard:fuel:${dan}`, fuel, deviceId );   
        }
        if (fuel > 0) {
            await this.red.zAdd(`leaderboard:fuel`, fuel, deviceId );
        }
    }
    async updateLeaderboardengineRPM(deviceId: string, engineRpm:number,daily:boolean)
    {
        const dan = new Date().toISOString().slice(0,10)
        if(daily && engineRpm>0)
        {
             await this.red.zAdd(`leaderboard:engineRpm:${dan}`, engineRpm, deviceId );   
        }
        if (engineRpm > 0) {
            await this.red.zAdd(`leaderboard:engineRpm`, engineRpm, deviceId );
        }
    }
    async updateLeaderboardTemp(deviceId: string, temp:number ,daily:boolean)
    {
        const dan = new Date().toISOString().slice(0,10)
        if (temp > 0 && daily) {
            await this.red.zAdd(`leaderboard:temp:${dan}`, temp, deviceId );
        }
        if (temp > 0) {
            await this.red.zAdd(`leaderboard:temp`, temp, deviceId );
        }
    }

    async getHelthScoreLeaderboard()
    {
        return await this.vratiVozila(`leaderboard:healthScore`, 5)
    }

    async updateHealthScore(deviceId: string, score:number,daily:boolean)
    {
        const dan = new Date().toISOString().slice(0,10)
        if(score>100)
        {
            score=100
        }
        else if(score<0)
        {
            score=0
        }
        if (score > 0 && daily) {
            await this.red.zAdd(`leaderboard:healthScore:${dan}`, score, deviceId );
        }
        if (score > 0) {
            await this.red.zAdd(`leaderboard:healthScore`, score, deviceId );
        }
    }
    
    async vratiVozila(key:string,limit=5)
    {
        const ranglista=await this.red.zTop(key,limit);

        
        console.log("RANGLISTA:", ranglista);

        const tabela:any[]=[]

        for(const r of ranglista)
        {
            try{
            const deviceId=r.value;
            const score=r.score
            const res= await this.cass.execute(
                `SELECT marka, model FROM vozila WHERE deviceid=?`,
                [
                    deviceId
                ],
            )
            
            const value= res.rows[0];
           
            tabela.push({
                deviceId,
                marka: value.marka,
                model: value.model,
                score: r.score
            });
            }
            catch(err)
            {
                return []
            }
        }
        return tabela
    }

    async resetLeaderboardove(parametar:string)
    {

        const keys= await this.red.keys(`leaderboard:${parametar}`)
        for(const k of keys)
        {
            await this.red.del(k);
        }
    }



    async izbaciIzTabele(parametar:string, deviceId: string, daily:boolean)
    {
        const dan= new Date().toISOString().slice(0,10)
        if(daily)
        {
            await this.red.zRem(`leaderboard:${parametar}:${dan}`,deviceId)
        }
        else
            await this.red.zRem(`leaderboard:${parametar}`, deviceId);
    }

    async ubaciUDailyLeaderboard(parametar:string, score:number, deviceId: string)
    {
        const dan= new Date().toISOString().slice(0,10)
        const redisKey= `leaderboard:${parametar}:${dan}`
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

     async OcistiTabelu(parametar:string)
    {
        const redisKey= `leaderboard:${parametar}`
        await this.red.del(redisKey)
        await this.red.expire(redisKey, 60*60*24*7)
    }

    async OcistiTabele()
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