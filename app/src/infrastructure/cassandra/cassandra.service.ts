import { Injectable , OnModuleInit, OnModuleDestroy} from "@nestjs/common";
import { Client,types } from "cassandra-driver";


@Injectable()
export class CassandraService{
    private CassClient: Client;
    

    constructor() {
        this.CassClient= new Client({
            contactPoints:['127.0.0.1'],
            localDataCenter:'datacenter1',
            keyspace: 'carmetrics',
        });
    }

    execute(query: string, params: any[]=[], prepare=true,)
    {
        return this.CassClient.execute(query, params, {prepare})
    }

   
    toDay(iso:string): string {
        return iso.slice(0,10)
    }
}