import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Room } from '../entities/room.entity';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/message.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Room)
        private roomRepository: Repository<Room>,
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
    ) { }

    async getUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async setUserOnline(userId: number, isOnline: boolean): Promise<void> {
        await this.userRepository.update(userId, { isOnline });
    }

    async getRoomById(id: number): Promise<Room | null> {
        return this.roomRepository.findOne({
            where: { id },
            relations: ['users', 'messages'],
        });
    }

    async getRooms(): Promise<Room[]> {
        return this.roomRepository.find({
            relations: ['users'],
            order: { updatedAt: 'DESC' },
        });
    }

    async createRoom(name: string, description?: string): Promise<Room> {
        const room = this.roomRepository.create({
            name,
            description,
        });
        return this.roomRepository.save(room);
    }

    async getMessages(roomId: number, limit = 50): Promise<Message[]> {
        return this.messageRepository.find({
            where: { room: { id: roomId } },
            relations: ['sender', 'room'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async createMessage(data: CreateMessageDto & { senderId: number }): Promise<Message | null> {
        const message = this.messageRepository.create({
            content: data.content,
            type: data.type || 'text',
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            fileSize: data.fileSize,
            sender: { id: data.senderId },
            room: { id: data.roomId },
        });

        const savedMessage = await this.messageRepository.save(message);

        return this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['sender', 'room'],
        });
    }
}