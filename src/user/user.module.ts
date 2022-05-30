import { UserRepository } from './repository/user.repository';
import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { JwtModule } from '@nestjs/jwt';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/models/entities/Users';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
    imports: [
        PassportModule.register({ session: false }),
        JwtModule.register({
            // secret: process.env.TOKENKEY,
        }),
        TypeOrmModule.forFeature([Users]),
    ],
    providers: [UserService, UserRepository, JwtStrategy],
    controllers: [UserController],
    exports: [UserRepository, UserService],
})
export class UserModule {}
