/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AutoMap } from '@automapper/classes';
import { Helpers } from '../utils';

export class UserDTO {
    @AutoMap() username: string;
    @AutoMap() name: string;
    @AutoMap() is_active: 0 | 1;
    @AutoMap() role: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;

    /**
     * Check if a variable is a `UserDTO` instance or not
     * @param data - any variable
     * @returns `data` is a `UserDTO` instance or not
     */
    public static is(data: any): data is UserDTO & {
        [key: string]: any;
    } {
        return (
            data !== null &&
            typeof data === 'object' &&
            Helpers.isString(data?.username) &&
            (Number(data?.is_active) === 1 || Number(data?.is_active) === 0) &&
            Helpers.isString(data?.created_date) &&
            Helpers.isString(data?.updated_date)
        );
    }
}

export class UserSaveDTO {
    @AutoMap() username: string;
    @AutoMap() name: string;
    @AutoMap() password: string;
    @AutoMap() is_active: 0 | 1;
}
