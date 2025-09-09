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
import { ChatService } from 'src/chat/chat.service';
import { CallLotoService } from './call-loto.service';
import { generateRandomNumber } from 'src/utils/uitls';

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
        private chatService: ChatService,
        private callLotoService: CallLotoService,
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
                console.log(`ws::call-loto>>User connected`);
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
        console.log(`ws::call-loto>>User connected`);
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: number },
    ) {
        if (!client.data.user) return;
        console.log('ws::call-loto>>Join Room', data.roomId)
        client.join(`room-${data.roomId}`);
        client.emit('joinedRoom', { roomId: data.roomId, roomName: data.roomId });

        /**
         * get data current match
         */
        let match = {
            current_match: '',
            history_number: [0],
            current_number: 0
        }

        let arrCalledNumber: number[] = [];
        let lastCalledNumber: string | number | null = null;
        let current_match: string = ''

        /**
         ** Lấy ván đang diễn ra
         */
        let resultLastedMatch = await this.callLotoService.getLastedMatch();
        if (resultLastedMatch) {
            current_match = String(resultLastedMatch.id);

            //* Lấy thông tin của ván đấy
            let resultDetailMatch = await this.callLotoService.getDetailMatch(resultLastedMatch.id);
            if (resultDetailMatch && resultDetailMatch.length > 0) {
                arrCalledNumber = resultDetailMatch.map(item => Number(item.calledNumber));
                lastCalledNumber = arrCalledNumber[arrCalledNumber.length - 1];
            } else {
                arrCalledNumber = [];
                lastCalledNumber = null;
            }
        } else {
            current_match = 'no_have_match';
            arrCalledNumber = [];
            lastCalledNumber = null;
        }


        match.current_match = current_match;
        match.history_number = arrCalledNumber;
        match.current_number = lastCalledNumber as any;
        client.emit('roomMatch', { roomId: data.roomId, match: match });
    }

    @SubscribeMessage('callLoto')
    async handleCallLoto(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string, matchId: string | number },
    ) {

        console.log('ws::call-loto>>Call Loto', data);

        try {
            let resultDetailMatch = await this.callLotoService.getDetailMatch(Number(data.matchId));
            let arrCalledNumber: number[] = [];
            if (resultDetailMatch && resultDetailMatch.length > 0) {
                arrCalledNumber = resultDetailMatch.map(item => Number(item.calledNumber));
            } else {
                arrCalledNumber = [];
            }
            // console.log('ws::call-loto>>Call Loto', generateRandomNumber(arrCalledNumber))
            let resultSaveNewNumber = await this.callLotoService.saveNewNumber(Number(data.matchId), generateRandomNumber(arrCalledNumber));

            /**
             * get data current match
             */
            // const messages = await this.chatService.getMessages(data.roomId);
            let match = {
                current_match: data.matchId,
                history_number: [0],
                current_number: 0
            }

            /**
             * Lấy danh mang các số đã gọi ở ván gần nhất
             */
            resultDetailMatch = await this.callLotoService.getDetailMatch(Number(data.matchId));
            arrCalledNumber = [];
            let lastCalledNumber: string | number | null = null;
            if (resultDetailMatch && resultDetailMatch.length > 0) {
                arrCalledNumber = resultDetailMatch.map(item => Number(item.calledNumber));
                lastCalledNumber = arrCalledNumber[arrCalledNumber.length - 1];
            } else {
                arrCalledNumber = [];
                lastCalledNumber = null;
            }
            match.history_number = arrCalledNumber;
            match.current_number = lastCalledNumber as any;
            this.server.to(`room-g_loto`).emit('newNumber', { roomId: data.roomId, match: match });
        } catch (error) {
            client.emit('error', { error: error.message });
        }
    }

    @SubscribeMessage('newGame')
    async handleNewGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string },
    ) {
        try {
            let resultCreateNewGame = await this.callLotoService.createNewGame();
            console.log('resultCreateNewGame', resultCreateNewGame);



            /**
             * get data current match
             */
            // const messages = await this.chatService.getMessages(data.roomId);
            let match = {
                current_match: '',
                history_number: [2, 4, 5, 6, 78, 7, 8],
                current_number: 87
            }


            /**
             * Lấy danh mang các số đã gọi ở ván gần nhất
             */
            let resultDetailMatch = await this.callLotoService.getDetailMatch(resultCreateNewGame.id);
            let arrCalledNumber: number[] = [];
            let lastCalledNumber: string | number | null = null;
            let resultLastedMatch = await this.callLotoService.getLastedMatch();
            if (resultLastedMatch) {
                match.current_match = String(resultLastedMatch.id);
            } else {
                match.current_match = 'no_have_match';
            }

            if (resultDetailMatch && resultDetailMatch.length > 0) {
                arrCalledNumber = resultDetailMatch.map(item => item.calledNumber);
                lastCalledNumber = arrCalledNumber[arrCalledNumber.length - 1];
            } else {
                arrCalledNumber = [];
                lastCalledNumber = null;
            }
            match.history_number = arrCalledNumber;
            match.current_number = lastCalledNumber as any;

            this.server.to(`room-g_loto`).emit('createdNewGame', { roomId: data.roomId, match: match });
        } catch (error) {
            console.log('error', error)
        }

    }
}