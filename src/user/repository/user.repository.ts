import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/models/entities/Users';
import { Repository } from 'typeorm';
import { UserCreateDto } from '../dto/user.create.dto';

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(Users) private readonly User: Repository<Users>,
    ) {}

    getUserBySocial(social: string, socialId: string): Promise<Users> {
        return this.User.findOne({ where: { social, socialId } });
    }

    getUserById(userId: string): Promise<Users> {
        return this.User.findOne({ where: { userId } });
    }

    createUser(data: UserCreateDto) {
        return this.User.createQueryBuilder()
            .insert()
            .into(Users)
            .values({ ...data })
            .execute();
    }

    deleteUser(userId: string) {
        return this.User.createQueryBuilder()
            .delete()
            .where('userId = :userId', { userId })
            .execute();
    }

    updateUser(userId: string, body: object) {
        return this.User.createQueryBuilder()
            .update()
            .set({ ...body })
            .where('userId = :userId', { userId })
            .execute();
    }
}
