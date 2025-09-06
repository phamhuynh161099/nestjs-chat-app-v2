import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { UploadController } from './upload/upload.controller';
import { CallLotoModule } from './call-loto/call-loto.module';

console.log('__dirname:', __dirname);
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    AuthModule,
    ChatModule,
    CallLotoModule
  ],
  controllers: [UploadController],
})
export class AppModule {}