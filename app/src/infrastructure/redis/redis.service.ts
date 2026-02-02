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

    async keys(key:string)
    {
        return await this.redisClient.keys(key)
    }

    async get(key:string)
    {
        return await this.redisClient.get(key);
    }

    async set(key:string, value: string, ttl?:string)
    {
        return await this.redisClient.set(key, value);
    }
    //za heshiranje
    async hset(key:string, field: string, value:string)
    {
        return await this.redisClient.hSet(key,field, value);
    }

    async hGet(key:string, field:string)
    {
        return await this.redisClient.hGet(key, field)
    }
    async hGetAllHash(key: string)
    {
        return await this.redisClient.hGetAll(key);
    }

    async hDel(key:string, field:string)
    {
        return await this.redisClient.hDel(key , field)
    }

    async lPush(key: string, value: string)
    {
        return await this.redisClient.lPush(key, JSON.stringify(value));
    
    }
    
    async getInrange(key: string, startValue=0, stop=20)
    {
        const data= await this.redisClient.lRange(key,startValue, stop)
        return await data.map(v=>JSON.parse(v));
    }

    async incr(key: string)
    {
        return await this.redisClient.incr(key)
    }

    async incrBy(key: string, value:number)
    {
        return await this.redisClient.incrBy(key, value);
    }

    async zAdd(key: string, score: number, member: string)
    {
        return await this.redisClient.zAdd(key, {
            score, value: member,
        });
    }

    async zTop(key: string, limit = 10) {
        return this.redisClient.zRangeWithScores(key, 0, limit-1)
    }


    async del(key:string)
    {
        return await this.redisClient.del(key)
    }

    async sadd(key:string, member: string)
    {
        return await this.redisClient.sAdd(key, member)
    }

    async sRem(key: string, member: string)
    {
        return await this.redisClient.sRem(key, member)
    }

    async lTrim(key:string, start:number, stop:number)
    {
        return await this.redisClient.lTrim(key, start, stop);
    }

    async expire(key:string, second:number)
    {
        return await this.redisClient.expire(key, second)
    }

    async exists(key:string)
    {
        return await this.redisClient.exists(key)
    }

    async zRem(key:string, member:string)
    {
        return await this.redisClient.zRem(key, member)
    }

    async lRange(key:string, start:number, stop: number)
    {
        return await this.redisClient.lRange(key, start, stop)
    }

    async lRem(key:string, count:number, element:any)
    {
        return await this.redisClient.lRem(key, count, element)
    }

    async geoAdd(key:string, longitude:number, latitude:number, member:string)
    {
        return await this.redisClient.geoAdd(key, {latitude, longitude, member})
    }

    async geoRadius(key:string, longitude:number, latitude:number, radius:number, )
    {
        return await this.redisClient.geoRadius(key, {longitude, latitude}, radius,"km")
    }
}
