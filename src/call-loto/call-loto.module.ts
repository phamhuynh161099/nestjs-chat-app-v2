import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ChatController } from './chat.controller';
import { User } from '../entities/user.entity';
import { CallLotoService } from './call-loto.service';
import { CallLotoGateway } from './call-loto.gateway';
import { ChatService } from 'src/chat/chat.service';
import { Room } from 'src/entities/room.entity';
import { Message } from 'src/entities/message.entity';
import { MatchDetail } from 'src/entities/match-detail';
import { Match } from 'src/entities/match';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Room,
            Message,
            MatchDetail,
            Match
        ]),
        JwtModule.register({
            secret: 'your-secret-key',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    providers: [
        CallLotoService,
        ChatService,
        CallLotoGateway
    ],
    // controllers: [ChatController],
})
export class CallLotoModule { }