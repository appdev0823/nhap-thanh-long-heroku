import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { CustomerDTO, InvoiceDTO, InvoiceDateStatsDTO, InvoiceDetailDTO, InvoiceListItemDTO, InvoiceSaveDTO } from 'src/dtos';
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
        @Query() query: { start_date?: string; end_date?: string; customer_id_list?: string[]; page?: number },
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

    @Get(ROUTES.INVOICE.DATE_STATS_LIST)
    public async getDateStatsList(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIListResponse<InvoiceDateStatsDTO>>,
        @Query() query: { start_date: string; end_date: string; page?: number },
    ) {
        try {
            const total = await this._invoiceService.getDateStatsCount(query);
            let list: InvoiceDateStatsDTO[] = [];
            if (total > 0) {
                list = await this._invoiceService.getDateStatsList(query);
                if (!Helpers.isFilledArray(list)) {
                    const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_NO_DATA);
                    return res.status(HttpStatus.BAD_REQUEST).json(errRes);
                }
            }

            const successRes = APIListResponse.success<InvoiceDateStatsDTO>(MESSAGES.SUCCESS.SUCCESS, list, total);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getDateStatsList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.INVOICE.CUSTOMER_LIST)
    public async getCustomerList(@Req() req: AuthenticatedRequest, @Res() res: Response<APIListResponse<CustomerDTO>>) {
        try {
            const list = await this._invoiceService.getCustomerList();
            const successRes = APIListResponse.success<CustomerDTO>(MESSAGES.SUCCESS.SUCCESS, list, list.length);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getDateStatsList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.INVOICE.TOTAL_STATS)
    public async getTotalStats(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<{ total_price: number; total_weight: number } | null>>,
        @Query() query: { start_date?: string; end_date?: string },
    ) {
        try {
            const stats = await this._invoiceService.getTotalStats(query);
            if (!stats) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<{ total_price: number; total_weight: number }>(MESSAGES.SUCCESS.SUCCESS, stats);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getTotalStats.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.INVOICE.DETAIL)
    public async getDetail(@Param('id') id: number, @Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<InvoiceDetailDTO | null>>) {
        try {
            const item = await this._invoiceService.getDetail(id);
            if (!item) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_NOT_FOUND);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success<InvoiceDetailDTO>(MESSAGES.SUCCESS.SUCCESS, item);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getDetail.name, e);
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
            this._logger.error(this.delete.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
