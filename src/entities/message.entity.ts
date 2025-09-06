import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Room } from './room.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    @Column({ default: 'text' }) // text, image, file
    type: string;

    @Column({ nullable: true })
    fileName: string;

    @Column({ nullable: true })
    fileUrl: string;

    @Column({ nullable: true })
    fileSize: number;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, user => user.messages)
    sender: User;

    @ManyToOne(() => Room, room => room.messages)
    room: Room;
}