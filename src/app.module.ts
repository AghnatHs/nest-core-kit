import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const env: string = process.env.NODE_ENV || 'development';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${env}`,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
