import { Module } from '@nestjs/common';
import { HealthcheckController } from './controllers/healthcheck.controller';
import { PromoController } from './controllers/promo.controller';
import { PromoService } from './services/promo.service';
import { ActivationController } from './controllers/activation.controller';
import { PrismaService } from './services/prisma.service';
import { ActivationService } from './services/activation.service';

@Module({
  imports: [],
  controllers: [HealthcheckController, PromoController, ActivationController],
  providers: [PromoService, ActivationService, PrismaService],
})
export class AppModule {}
