import { Module } from "@nestjs/common";
import { OdrzavanjeController } from "./maintenance.controller";
import { OdrzavanjeService } from "./maintenance.service";

@Module(
    {
        controllers: [OdrzavanjeController],
        providers: [OdrzavanjeService],
        exports: [OdrzavanjeService]
    }
)
export class OdrzavanjeModule{}
