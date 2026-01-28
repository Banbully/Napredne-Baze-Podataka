import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";
@Injectable()
export class RedisService
{
    private redisClient: RedisClientType;

    constructor() {
        this.redisClient= createClient({
            socket:{host: "127.0.0.1", port: 6379},
        });
        this.redisClient.connect();
    }

    //wrapperi da ne pravimo client svaki put
    setJson(key:string, value:any, tt1?:number)
    {
        return tt1?this.redisClient.set(key, JSON.stringify(value), {EX: tt1})
        :this.redisClient.set(key, JSON.stringify(value))
    }

    async getJSON<T>(key:string): Promise<T|null>
    {
        const value= await this.redisClient.get(key);
        return value? JSON.parse(value): null;
    }

    async get(key:string)
    {
        return this.redisClient.get(key);
    }

    async set(key:string, value: string)
    {
        return this.redisClient.set(key, value);
    }
    //za heshiranje
    hset(key:string, field: string, value:number| string)
    {
        return this.redisClient.hSet(key, field, value.toString());
    }

    hGetAllHash(key: string)
    {
        return this.redisClient.hGetAll(key);
    }

    hDel(key:string, field:string)
    {
        return this.redisClient.hDel(key , field)
    }

    lPush(key: string, value: number)
    {
        return this.redisClient.lPush(key, JSON.stringify(value));
    
    }
    
    async getInrange(key: string, startValue=0, stop=20)
    {
        const data= await this.redisClient.lRange(key,startValue, stop)
        return data.map(v=>JSON.parse(v));
    }

    async incr(key: string)
    {
        return this.redisClient.incr(key)
    }

    async incrBy(key: string, value:number)
    {
        return this.redisClient.incrBy(key, value);
    }

    async zAdd(key: string, score: number, member: string)
    {
        await this.redisClient.zAdd(key, {
            score, value: member,
        });
    }

    async zTop(key: string, limit=10)
    {
        return this.redisClient.zRangeWithScores(
            key,
            0,
            limit-1,
            {REV: true},
        );
    }

}