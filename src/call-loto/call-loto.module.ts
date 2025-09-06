import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ChatController } from './chat.controller';
import { User } from '../entities/user.entity';
import { CallLotoService } from './call-loto.service';
import { CallLotoGateway } from './call-loto.gateway';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: 'your-secret-key',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    providers: [CallLotoService,CallLotoGateway],
    // controllers: [ChatController],
})
export class CallLotoModule { }