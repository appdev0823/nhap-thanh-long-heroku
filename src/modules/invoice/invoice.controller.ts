import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { InvoiceDTO, InvoiceListItemDTO, InvoiceSaveDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, APIResponse, Helpers, MESSAGES } from 'src/utils';
import { AuthenticatedRequest } from 'src/utils/types';
import ROUTES from '../routes';
import { InvoiceService } from './invoice.service';

@Controller(ROUTES.INVOICE.MODULE)
export class InvoiceController extends BaseController {
    /** Constructor */
    constructor(private readonly _invoiceService: InvoiceService) {
        super();
    }

    @Get(ROUTES.INVOICE.LIST)
    public async getList(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIListResponse<InvoiceListItemDTO>>,
        @Query() query: { start_date?: string; end_date?: string; page?: number },
    ) {
        try {
            const total = await this._invoiceService.getTotal(query);
            let list: InvoiceListItemDTO[] = [];
            if (total > 0) {
                list = await this._invoiceService.getList(query);
                if (!Helpers.isFilledArray(list)) {
                    const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_NO_DATA);
                    return res.status(HttpStatus.BAD_REQUEST).json(errRes);
                }
            }

            const successRes = APIListResponse.success<InvoiceListItemDTO>(MESSAGES.SUCCESS.SUCCESS, list, total);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.INVOICE.TOTAL_PRICE)
    public async getTotalPrice(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<number>>,
        @Query() query: { start_date?: string; end_date?: string },
    ) {
        try {
            const totalPrice = await this._invoiceService.getTotalPrice(query);
            const successRes = APIResponse.success<number>(MESSAGES.SUCCESS.SUCCESS, totalPrice);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getList.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.INVOICE.CREATE)
    public async create(@Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<void>>, @Body() body: InvoiceSaveDTO) {
        try {
            body.created_by = req.userPayload.username;
            const isSuccess = await this._invoiceService.create(body);
            if (!isSuccess) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<void>(MESSAGES.SUCCESS.SUCCESS);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.create.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Delete(ROUTES.INVOICE.DELETE)
    public async delete(@Param('id') id: number, @Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<InvoiceDTO | undefined>>) {
        try {
            const ins = await this._invoiceService.getById(id);
            if (!ins) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_NO_DATA);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const result = await this._invoiceService.delete(id);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<InvoiceDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.create.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
