import { Injectable } from '@nestjs/common';
import { InvoiceDTO, InvoiceListItemDTO, InvoiceSaveDTO } from 'src/dtos';
import { InvoiceEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { InvoiceRepository, ProductRepository } from 'src/repository';
import { Helpers, mapper } from 'src/utils';
import { DataSource, In } from 'typeorm';

@Injectable()
export class InvoiceService extends BaseService {
    /** Constructor */
    constructor(
        private readonly _invoiceRepo: InvoiceRepository,
        private readonly _productRepo: ProductRepository,
        private readonly _dataSource: DataSource,
    ) {
        super();
    }

    public async create(data: InvoiceSaveDTO) {
        if (Helpers.isEmptyObject(data)) return false;

        const idList = data.product_list.map((item) => item.id);

        const prodList = await this._productRepo.find({ where: { id: In(idList) } });
        if (!Helpers.isFilledArray(prodList)) return false;

        const queryRunner = this._dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const invoice = new InvoiceEntity();
            invoice.customer_id = data.customer_id;
            invoice.customer_name = data.customer_name;
            invoice.weight_grid = JSON.stringify(data.weight_grid);
            invoice.product_list = JSON.stringify(data.product_list);
            invoice.total_price = data.total_price;
            invoice.total_weight = data.total_weight;
            invoice.created_by = data.created_by;

            await this._invoiceRepo.save(invoice);

            for (const prod of prodList) {
                const newPrice = data.product_list.find((item) => item.id === prod.id)?.price;
                prod.price = newPrice || 0;
            }

            await this._productRepo.save(prodList);

            await queryRunner.commitTransaction();
            return true;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    public async getList(params: { start_date?: string; end_date?: string }) {
        const query = this._invoiceRepo
            .createQueryBuilder('invoice')
            .select('invoice.*')
            .addSelect('DATE_FORMAT(invoice.created_date, \'%d/%m/%Y %h:%i:%s\') as created_date')
            .addSelect('user.name', 'user_name')
            .leftJoin('m_users', 'user', 'invoice.created_by = user.username')
            .where('invoice.is_deleted = 0');

        if (Helpers.isString(params.start_date)) {
            query.andWhere('invoice.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.andWhere('invoice.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
        }

        query.orderBy('invoice.id', 'DESC');

        // if (params?.page > 0) {
        //     const page = Number(params?.page);
        //     const skip = (page - 1) * CONSTANTS.ITEM_COUNT_PER_PAGE;
        //     query.skip(skip).take(CONSTANTS.ITEM_COUNT_PER_PAGE);
        // }

        const result = await query.getRawMany();
        return Helpers.isFilledArray(result) ? (result as InvoiceListItemDTO[]) : [];
    }

    public async getTotal(params: { start_date?: string; end_date?: string }) {
        const query = this._invoiceRepo.createQueryBuilder('invoice').where('invoice.is_deleted = 0');

        if (Helpers.isString(params.start_date)) {
            query.where('invoice.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.where('invoice.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
        }

        return query.getCount();
    }

    public async getById(id: number): Promise<InvoiceDTO | null> {
        if (!(id > 0)) return null;

        const item = await this._invoiceRepo.findOneBy({ id });
        if (!item) return null;

        return mapper.map(item, InvoiceEntity, InvoiceDTO);
    }

    public async delete(id: number): Promise<InvoiceDTO | null> {
        if (!(id > 0)) return null;

        const item = await this._invoiceRepo.findOneBy({ id });
        if (!item) return null;

        const entity = mapper.map(item, InvoiceEntity, InvoiceDTO);
        entity.is_deleted = 1;

        await this._invoiceRepo.save(entity);

        return entity;
    }
}
