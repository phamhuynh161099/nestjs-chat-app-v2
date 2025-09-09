import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Message } from './message.entity';
import { MatchDetail } from './match-detail';

@Entity({
    name: 'match'
})
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    match_name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    createdBy: string

    @OneToMany(() => MatchDetail, match_detail => match_detail.match)
    match_detail: MatchDetail[];

    @Column({
        comment: '1 is Open, 0 is Closed',
        default: 1
    })
    status: number
}