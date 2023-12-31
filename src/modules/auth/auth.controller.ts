import { Body, Controller, HttpStatus, Post, Req, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { UserDTO } from 'src/dtos';
import BaseController from 'src/includes/base.controller';
import { ValidationPipe } from 'src/pipes';
import { APIResponse, MESSAGES } from 'src/utils';
import ROUTES from '../routes';
import * as AuthSchemas from './auth.schemas';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from 'src/utils/types';

@Controller(ROUTES.AUTH.MODULE)
export class AuthController extends BaseController {
    /** Constructor */
    constructor(private readonly _authService: AuthService) {
        super();
    }

    /**
     * Login
     * @param body - `username` and `password` are required
     * @param res - user DTO with access token
     */
    @Post(ROUTES.AUTH.LOGIN)
    @UsePipes(new ValidationPipe(AuthSchemas.loginSchema))
    public async login(
        @Body() body: { username: string; password: string },
        @Res() res: Response<APIResponse<(UserDTO & { access_token: string }) | undefined>>,
    ) {
        try {
            const { username, password } = body;
            const loginRes = await this._authService.login(username, password);
            if (!loginRes) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_LOGIN);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }
            if (!loginRes.is_active) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_USER_DEACTIVATED);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success(MESSAGES.SUCCESS.SUCCESS, loginRes);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.login.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.AUTH.CHANGE_PASSWORD)
    public async changePassword(
        @Body() body: { old_password: string; new_password: string },
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<void>>,
    ) {
        try {
            const oldPassword = body.old_password;
            const newPassword = body.new_password;
            const username = req.userPayload.username;

            const isSuccess = await this._authService.changePassword(username, oldPassword, newPassword);
            if (!isSuccess) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_BAD_REQUEST);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success<void>(MESSAGES.SUCCESS.SUCCESS);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.changePassword.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
