import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';
import { Message } from '../entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '103.155.161.244',
      port: 3306,
      username: 'dbeaver_user',
      password: 'password123',
      database: 'chat_app_db',
      entities: [User, Room, Message],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}