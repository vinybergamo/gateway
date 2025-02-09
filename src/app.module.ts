import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChargesModule } from './charges/charges.module';
import { CustomersModule } from './customers/customers.module';
import { WebhookModule } from './webhook/webhook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FormatsModule } from './formats/formats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        '.env.development',
        '.env.production',
        '.env.test',
        '.env.local',
      ],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ChargesModule,
    CustomersModule,
    WebhookModule,
    FormatsModule,
  ],
})
export class AppModule {}
