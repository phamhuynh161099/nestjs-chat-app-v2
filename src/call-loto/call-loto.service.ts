import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { MatchDetail } from 'src/entities/match-detail';
import { Match } from 'src/entities/match';

@Injectable()
export class CallLotoService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(MatchDetail)
        private detailMatchRepository: Repository<MatchDetail>,

        @InjectRepository(Match)
        private matchRepository: Repository<Match>,
    ) { }

    getDetailMatch(id: number): Promise<any[]> {
        return this.detailMatchRepository.find(
            {
                select: ['calledNumber'],
                where: {
                    match: {
                        id: id
                    }
                },
                order: {
                    createdAt: 'ASC'
                }
            });
    }

    saveNewNumber(matchId: number, calledNumber: number) {
        const newDetail = this.detailMatchRepository.create({
            match: { id: matchId },
            calledNumber: calledNumber.toString(),
            createdBy: 'admin'
        });
        return this.detailMatchRepository.save(newDetail);
    }

    async createNewGame() {
        await this.matchRepository.updateAll({ status: 0 });
        const newMatch =  this.matchRepository.create({
            match_name: 'v1',
            createdBy: 'admin'
        });
        return this.matchRepository.save(newMatch);
    }
    
    async getLastedMatch() {
        return this.matchRepository.findOne({
            where: {
                status: 1
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }
    


}