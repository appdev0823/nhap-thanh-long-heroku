import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserDTO, UserSaveDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, APIResponse, Helpers, MESSAGES } from 'src/utils';
import { AuthenticatedRequest, CommonSearchQuery } from 'src/utils/types';
import ROUTES from '../routes';
import { UserService } from './user.service';

@Controller(ROUTES.USER.MODULE)
export class UserController extends BaseController {
    /** Constructor */
    constructor(private readonly _userService: UserService) {
        super();
    }

    /**
     * Get user profile
     * @param req - Authenticated request
     * @param res - User data
     */
    @Get(ROUTES.USER.PROFILE)
    public async getProfile(@Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<UserDTO | undefined>>) {
        try {
            const result = await this._userService.getByUsername(req.userPayload.username);
            if (!result) {
                const unauthorizedErrRes = APIResponse.error(MESSAGES.ERROR.ERR_UNAUTHORIZED);
                return res.status(HttpStatus.UNAUTHORIZED).json(unauthorizedErrRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getProfile.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.USER.LIST)
    public async getList(@Req() req: AuthenticatedRequest, @Res() res: Response<APIListResponse<UserDTO>>, @Query() query: CommonSearchQuery) {
        try {
            const total = await this._userService.getTotal();
            let list: UserDTO[] = [];
            if (total > 0) {
                list = await this._userService.getList(query);
                if (!Helpers.isFilledArray(list)) {
                    const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_NO_DATA);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
                }
            }

            const successRes = APIListResponse.success<UserDTO>(MESSAGES.SUCCESS.SUCCESS, list, total);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.USER.DETAIL)
    public async getDetail(@Param('username') username: string, @Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<UserDTO | null>>) {
        try {
            const item = await this._userService.getDetail(username);
            if (!item) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_NOT_FOUND);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success<UserDTO>(MESSAGES.SUCCESS.SUCCESS, item);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getDetail.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.USER.CREATE)
    public async create(@Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<UserDTO | undefined>>, @Body() body: UserSaveDTO) {
        try {
            const ins = await this._userService.getByUsername(body.username);
            if (ins) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_USERNAME_EXISTED);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const user = new UserSaveDTO();
            user.username = body.username;
            user.password = body.password;
            user.name = body.name;
            user.is_active = body.is_active;

            const result = await this._userService.create(user);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<UserDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.create.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Put(ROUTES.USER.UPDATE)
    public async update(@Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<UserDTO | undefined>>, @Body() body: UserSaveDTO) {
        try {
            const ins = await this._userService.getByUsername(body.username);
            if (!ins) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_NO_DATA);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const user = new UserSaveDTO();
            user.username = body.username;
            if (Helpers.isString(body.password)) {
                user.password = body.password;
            }
            user.name = body.name;
            user.is_active = body.is_active;

            const result = await this._userService.update(user);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<UserDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.update.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Put(ROUTES.USER.TOGGLE)
    public async toggle(
        @Param('username') username: string,
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<UserDTO | undefined>>,
        @Body() body: { is_active: boolean },
    ) {
        try {
            const ins = await this._userService.getByUsername(username);
            if (!ins) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_NO_DATA);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const result = await this._userService.toggle(username, body.is_active ? true : false);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<UserDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.toggle.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
