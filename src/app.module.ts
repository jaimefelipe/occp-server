import { Module } from '@nestjs/common';
import { OcppGateway } from './ocpp.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [OcppGateway],
})
export class AppModule {}