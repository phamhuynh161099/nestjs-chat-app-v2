import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto, LoginDto } from '../dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<any> {
        const { username, email, password } = registerDto;

        const existingUser = await this.userRepository.findOne({
            where: [{ username }, { email }]
        });

        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = this.userRepository.create({
            username,
            email,
            password: hashedPassword,
        });

        await this.userRepository.save(user);

        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            }
        };
    }

    async login(loginDto: LoginDto): Promise<any> {
        const { username, password } = loginDto;

        const user = await this.userRepository.findOne({ where: { username } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        await this.userRepository.update(user.id, { isOnline: true });

        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            }
        };
    }

    async validateUser(userId: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id: userId } });
    }

    async logout(userId: number): Promise<void> {
        await this.userRepository.update(userId, { isOnline: false });
    }
}