import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/call-loto',
})
@Injectable()
export class CallLotoGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers: Map<number, string> = new Map();

    constructor(
        private jwtService: JwtService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            const payload = this.jwtService.verify(token);
            // const user = await this.chatService.getUserById(payload.sub);

            // if (user) {
            //     client.data.user = user;
            //     this.connectedUsers.set(user.id, client.id);
            //     await this.chatService.setUserOnline(user.id, true);

            //     client.emit('connected', { user: { id: user.id, username: user.username } });
            //     this.server.emit('userOnline', { userId: user.id, username: user.username });

            console.log(`ws::call-loto>>User connected`);
            // }
        } catch (error) {
            console.log('Connection error:', error);
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        if (client.data.user) {
            // const user = client.data.user;
            // this.connectedUsers.delete(user.id);
            // await this.chatService.setUserOnline(user.id, false);

            // this.server.emit('userOffline', { userId: user.id, username: user.username });
            // console.log(`User ${user.username} disconnected`);
        }

        console.log(`ws::call-loto>>User connected`);
    }

    // @SubscribeMessage('joinRoom')
    // async handleJoinRoom(
    //     @ConnectedSocket() client: Socket,
    //     @MessageBody() data: { roomId: number },
    // ) {
    //     if (!client.data.user) return;

    //     const room = await this.chatService.getRoomById(data.roomId);
    //     if (room) {
    //         client.join(`room-${data.roomId}`);
    //         client.emit('joinedRoom', { roomId: data.roomId, roomName: room.name });

    //         // Send recent messages
    //         const messages = await this.chatService.getMessages(data.roomId);
    //         client.emit('roomMessages', { roomId: data.roomId, messages });
    //     }
    // }
}