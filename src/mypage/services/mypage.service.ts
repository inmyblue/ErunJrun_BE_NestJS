import { GroupRepository } from './../../groups/repository/groups.repository';
import { UserRepository } from 'src/user/repository/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MypageService {
    constructor(
        private readonly UserRepository: UserRepository,
        private readonly GroupRepository: GroupRepository,
    ) {}

    async getUserInfo(userId: string): Promise<object> {
        let result: { [key: string]: object } = {};
        const data = await this.UserRepository.getUserById(userId);
        const waiting = await this.GroupRepository.getApplyGroupByUserId(
            userId,
        );

        switch (data.likeLocation) {
            case '1':
                data.likeLocation = '서울';
                break;
            case '2':
                data.likeLocation = '경기도';
                break;
            case '3':
                data.likeLocation = '인천광역시';
                break;
            case '4':
                data.likeLocation = '강원도';
                break;
            case '5':
                data.likeLocation = '충청도/세종특별시/대전광역시';
                break;
            case '6':
                data.likeLocation = '경상북도/대구광역시';
                break;
            case '7':
                data.likeLocation = '경상남도/부산광역시/울산광역시';
                break;
            case '8':
                data.likeLocation = '전라도/광주광역시';
                break;
            case '9':
                data.likeLocation = '제주특별시';
                break;
        }

        switch (data.likeDistance) {
            case '0':
                data.likeDistance = '잘 모르겠어요';
                break;
            case '1':
                data.likeDistance = '5km 미만';
                break;
            case '2':
                data.likeDistance = '5km이상 10km미만';
                break;
            case '3':
                data.likeDistance = '10km이상 15km미만';
                break;
            case '4':
                data.likeDistance = '15km 이상';
                break;
        }

        result.userInfo = data;
        result.waiting = waiting;

        return result;
    }

    getUserForUpdate(userId: string): Promise<object> {
        return this.UserRepository.getUserById(userId);
    }

    updateUser(userId: string, body: object) {
        return this.UserRepository.updateUser(userId, body);
    }

    addUserData(userId: string, body: object) {
        return this.UserRepository.updateUser(userId, body);
    }
}
