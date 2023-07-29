import { Injectable } from '@nestjs/common';
import { UserDTO, UserSaveDTO } from 'src/dtos';
import { UserEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { UserRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import { CommonSearchQuery } from 'src/utils/types';

@Injectable()
export class UserService extends BaseService {
    /** Constructor */
    constructor(private readonly _userRepo: UserRepository) {
        super();
    }

    public async getByUsername(username: string) {
        if (!Helpers.isString(username)) return null;

        const user = await this._userRepo.findOneBy({ username });
        if (Helpers.isEmptyObject(user)) return null;

        return mapper.map(user, UserEntity, UserDTO);
    }

    public async getList(params: CommonSearchQuery) {
        const query = this._userRepo.createQueryBuilder('user').orderBy('user.created_date', 'ASC');

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        const list = await query.getMany();
        if (!Helpers.isFilledArray(list)) return [];

        return list.map((product) => mapper.map(product, UserEntity, UserDTO));
    }

    public async getTotal() {
        const query = this._userRepo.createQueryBuilder('user');
        return query.getCount();
    }

    public async getDetail(username: string): Promise<UserDTO | null> {
        if (!Helpers.isString(username)) return null;

        const item = await this._userRepo.findOneBy({ username });
        if (!item) return null;

        return mapper.map(item, UserEntity, UserDTO);
    }

    public async create(product: UserSaveDTO): Promise<UserDTO | null> {
        if (Helpers.isEmptyObject(product)) return null;

        const user = mapper.map(product, UserSaveDTO, UserEntity);
        user.role = CONSTANTS.USER_ROLES.REGULAR;

        await this._userRepo.save(user);

        return mapper.map(user, UserEntity, UserDTO);
    }

    public async update(product: UserSaveDTO): Promise<UserDTO | null> {
        if (Helpers.isEmptyObject(product)) return null;

        const entity = mapper.map(product, UserSaveDTO, UserEntity);

        await this._userRepo.save(entity);

        return mapper.map(entity, UserEntity, UserDTO);
    }

    public async toggle(username: string, isActive: boolean): Promise<UserDTO | null> {
        if (!Helpers.isString(username)) return null;

        const item = await this._userRepo.findOneBy({ username });
        if (!item) return null;

        const entity = mapper.map(item, UserEntity, UserDTO);
        entity.is_active = isActive ? 1 : 0;

        await this._userRepo.save(entity);

        return entity;
    }
}
