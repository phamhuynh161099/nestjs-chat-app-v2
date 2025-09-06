import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Room } from './room.entity';
import { Match } from './match';

@Entity({
    name: 'match_detail'
})
export class MatchDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    calledNumber: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    createdBy: string

    @ManyToOne(() => Match, match => match.match_detail)
    match: Match;
}