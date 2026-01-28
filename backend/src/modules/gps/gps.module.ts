import { Module } from "@nestjs/common";
import { GPSService } from "./gps.service";
import { GPSController } from "./gps.controller";

@Module({
    controllers:[GPSController],
    providers:[GPSService],
    exports:[GPSService]
})
export class GPSModule{}