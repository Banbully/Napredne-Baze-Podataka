import { Module } from "@nestjs/common";
import { VehicleService } from "./vehicles.service";
import { VehicleController } from "./vehicles.controller";

@Module({
    controllers:[VehicleController],
    providers: [VehicleService],
    exports: [VehicleService]
})
export class VehicleModule{}
