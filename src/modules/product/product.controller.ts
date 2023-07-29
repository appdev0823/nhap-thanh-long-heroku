import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProductDTO, ProductStatsDTO } from 'src/dtos';
import { BaseController } from 'src/includes';
import { APIListResponse, APIResponse, Helpers, MESSAGES } from 'src/utils';
import { AuthenticatedRequest, CommonSearchQuery } from 'src/utils/types';
import ROUTES from '../routes';
import { ProductService } from './product.service';

@Controller(ROUTES.PRODUCT.MODULE)
export class ProductController extends BaseController {
    /** Constructor */
    constructor(private readonly _productService: ProductService) {
        super();
    }

    @Get(ROUTES.PRODUCT.LIST)
    public async getList(@Req() req: AuthenticatedRequest, @Res() res: Response<APIListResponse<ProductDTO>>, @Query() query: CommonSearchQuery) {
        try {
            const total = await this._productService.getTotal();
            let list: ProductDTO[] = [];
            if (total > 0) {
                list = await this._productService.getList(query);
                if (!Helpers.isFilledArray(list)) {
                    const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_NO_DATA);
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
                }
            }

            const successRes = APIListResponse.success<ProductDTO>(MESSAGES.SUCCESS.SUCCESS, list, total);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.PRODUCT.STATS_LIST)
    public async getStatsList(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIListResponse<ProductStatsDTO>>,
        @Query() query: { start_date: string; end_date: string },
    ) {
        try {
            const list = await this._productService.getStatsList(query);
            const successRes = APIListResponse.success<ProductStatsDTO>(MESSAGES.SUCCESS.SUCCESS, list, list.length);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getStatsList.name, e);
            const errRes = APIListResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Get(ROUTES.PRODUCT.DETAIL)
    public async getDetail(@Param('id') id: number, @Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<ProductDTO | null>>) {
        try {
            const item = await this._productService.getDetail(id);
            if (!item) {
                const errRes = APIResponse.error(MESSAGES.ERROR.ERR_NOT_FOUND);
                return res.status(HttpStatus.BAD_REQUEST).json(errRes);
            }

            const successRes = APIResponse.success<ProductDTO>(MESSAGES.SUCCESS.SUCCESS, item);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.getDetail.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Post(ROUTES.PRODUCT.CREATE)
    public async create(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<ProductDTO | undefined>>,
        @Body() body: { name: string; price: number; is_original: boolean },
    ) {
        try {
            const total = await this._productService.getTotal();

            const product = new ProductDTO();
            product.name = body.name;
            product.price = body.price;
            product.is_original = body.is_original ? 1 : 0;
            product.order = total + 1;

            const result = await this._productService.create(product);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<ProductDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.create.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Put(ROUTES.PRODUCT.UPDATE_ORDER)
    public async updateOrder(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<void>>,
        @Body() body: { id: number; order: number }[],
    ) {
        try {
            if (!Helpers.isFilledArray(body)) {
                const errRes = APIResponse.error<void>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const isSuccess = await this._productService.updateOrder(body);
            if (!isSuccess) {
                const errRes = APIResponse.error<void>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<void>(MESSAGES.SUCCESS.SUCCESS);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.updateOrder.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Put(ROUTES.PRODUCT.UPDATE)
    public async update(
        @Req() req: AuthenticatedRequest,
        @Res() res: Response<APIResponse<ProductDTO | undefined>>,
        @Body() body: { id: number; name: string; price: number; is_original: boolean },
    ) {
        try {
            const ins = await this._productService.getById(body.id);
            if (!ins) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_NO_DATA);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const product = new ProductDTO();
            product.id = body.id;
            product.name = body.name;
            product.price = body.price;
            product.is_original = body.is_original ? 1 : 0;

            const result = await this._productService.update(product);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<ProductDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.update.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }

    @Delete(ROUTES.PRODUCT.DELETE)
    public async delete(@Param('id') id: number, @Req() req: AuthenticatedRequest, @Res() res: Response<APIResponse<ProductDTO | undefined>>) {
        try {
            const ins = await this._productService.getById(id);
            if (!ins) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_NO_DATA);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const result = await this._productService.delete(id);
            if (Helpers.isEmptyObject(result)) {
                const errRes = APIResponse.error<undefined>(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
            }

            const successRes = APIResponse.success<ProductDTO | undefined>(MESSAGES.SUCCESS.SUCCESS, result);
            return res.status(HttpStatus.OK).json(successRes);
        } catch (e) {
            this._logger.error(this.delete.name, e);
            const errRes = APIResponse.error(MESSAGES.ERROR.ERR_INTERNAL_SERVER_ERROR);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errRes);
        }
    }
}
