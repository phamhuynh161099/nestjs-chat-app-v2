import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
// import { ChatController } from './chat.controller';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';
import { Message } from '../entities/message.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Room, Message]),
        JwtModule.register({
            secret: 'your-secret-key',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    providers: [ChatGateway, ChatService],
    // controllers: [ChatController],
})
export class ChatModule { }