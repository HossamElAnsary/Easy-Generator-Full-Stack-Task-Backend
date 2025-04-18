import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongo: MongooseHealthIndicator,
  ) {}

  /**
   * Liveness & Readiness probe endpoint.
   * Kubernetes can call this to know if the app is up and if Mongo is reachable.
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.mongo.pingCheck('mongodb', {
          // timeout in ms before marking Mongo as unhealthy
          timeout: 1500,
        }),
    ]);
  }
}
