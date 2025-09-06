import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from '../dto/message.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers: Map<number, string> = new Map();

    constructor(
        private chatService: ChatService,
        private jwtService: JwtService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token);
            const user = await this.chatService.getUserById(payload.sub);

            if (user) {
                client.data.user = user;
                this.connectedUsers.set(user.id, client.id);
                await this.chatService.setUserOnline(user.id, true);

                client.emit('connected', { user: { id: user.id, username: user.username } });
                this.server.emit('userOnline', { userId: user.id, username: user.username });

                console.log(`User ${user.username} connected`);
            }
        } catch (error) {
            console.log('Connection error:', error);
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        if (client.data.user) {
            const user = client.data.user;
            this.connectedUsers.delete(user.id);
            await this.chatService.setUserOnline(user.id, false);

            this.server.emit('userOffline', { userId: user.id, username: user.username });
            console.log(`User ${user.username} disconnected`);
        }
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: number },
    ) {
        if (!client.data.user) return;

        const room = await this.chatService.getRoomById(data.roomId);
        if (room) {
            client.join(`room-${data.roomId}`);
            client.emit('joinedRoom', { roomId: data.roomId, roomName: room.name });

            // Send recent messages
            const messages = await this.chatService.getMessages(data.roomId);
            client.emit('roomMessages', { roomId: data.roomId, messages });
        }
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: number },
    ) {
        client.leave(`room-${data.roomId}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() createMessageDto: CreateMessageDto,
    ) {
        if (!client.data.user) return;

        try {
            const message = await this.chatService.createMessage({
                ...createMessageDto,
                senderId: client.data.user.id,
            });

            this.server.to(`room-${createMessageDto.roomId}`).emit('newMessage', message);
        } catch (error) {
            client.emit('messageError', { error: error.message });
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: number, isTyping: boolean },
    ) {
        if (!client.data.user) return;

        client.to(`room-${data.roomId}`).emit('userTyping', {
            userId: client.data.user.id,
            username: client.data.user.username,
            isTyping: data.isTyping,
        });
    }
}