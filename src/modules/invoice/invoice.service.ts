import { Injectable } from '@nestjs/common';
import { CustomerDTO, InvoiceDTO, InvoiceDateStatsDTO, InvoiceDetailDTO, InvoiceListItemDTO, InvoiceProductDTO, InvoiceSaveDTO } from 'src/dtos';
import { InvoiceEntity, InvoiceProductEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { InvoiceRepository, ProductRepository, InvoiceProductRepository, UserRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import { DataSource, In } from 'typeorm';

@Injectable()
export class InvoiceService extends BaseService {
    /** Constructor */
    constructor(
        private readonly _invoiceRepo: InvoiceRepository,
        private readonly _productRepo: ProductRepository,
        private readonly _invoiceProductRepo: InvoiceProductRepository,
        private readonly _userRepo: UserRepository,
        private readonly _dataSource: DataSource,
    ) {
        super();
    }

    public async create(data: InvoiceSaveDTO) {
        if (Helpers.isEmptyObject(data)) return false;

        const idList = data.product_list.map((item) => item.product_id);

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
            invoice.total_price = data.total_price;
            invoice.total_weight = data.total_weight;
            invoice.created_by = data.created_by;

            await this._invoiceRepo.save(invoice);

            for (const prod of prodList) {
                const newPrice = data.product_list.find((item) => item.product_id === prod.id)?.product_price;
                prod.price = newPrice || 0;
            }

            await this._productRepo.save(prodList);

            const invProdList = data.product_list
                .filter((prod) => prod.product_weight > 0)
                .map((prod) => {
                    const invProd = new InvoiceProductEntity();
                    invProd.invoice_id = invoice.id;
                    invProd.product_id = prod.product_id;
                    invProd.product_name = prod.product_name;
                    invProd.product_price = prod.product_price;
                    invProd.product_order = prod.product_order;
                    invProd.product_weight = prod.product_weight;
                    invProd.product_is_original = prod.product_is_original;
                    return invProd;
                });

            await this._invoiceProductRepo.save(invProdList);

            await queryRunner.commitTransaction();
            return true;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    public async getList(params: { start_date?: string; end_date?: string; customer_id_list?: string[]; page?: number }) {
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

        if (Helpers.isFilledArray(params.customer_id_list)) {
            query.andWhere('invoice.customer_id IN (:...customer_id_list)', { customer_id_list: params.customer_id_list });
        }

        query.orderBy('invoice.id', 'DESC');

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        const result = await query.getRawMany();
        return Helpers.isFilledArray(result) ? (result as InvoiceListItemDTO[]) : [];
    }

    public async getTotal(params: { start_date?: string; end_date?: string; customer_id_list?: string[] }) {
        const query = this._invoiceRepo.createQueryBuilder('invoice').where('invoice.is_deleted = 0');

        if (Helpers.isString(params.start_date)) {
            query.andWhere('invoice.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.andWhere('invoice.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
        }

        if (Helpers.isFilledArray(params.customer_id_list)) {
            query.andWhere('invoice.customer_id IN (:...customer_id_list)', { customer_id_list: params.customer_id_list });
        }

        return query.getCount();
    }

    public async getTotalStats(params: { start_date?: string; end_date?: string }): Promise<{ total_price: number; total_weight: number } | null> {
        const query = this._invoiceRepo
            .createQueryBuilder('invoice')
            .select('SUM(invoice.total_price) as total_price')
            .addSelect('SUM(invoice.total_weight) as total_weight')
            .where('invoice.is_deleted = 0');

        if (Helpers.isString(params.start_date)) {
            query.andWhere('invoice.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.andWhere('invoice.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
        }

        const result = await query.getRawOne<{ total_price: number; total_weight: number }>();
        if (Helpers.isEmptyObject(result)) return null;

        return result;
    }

    public async getDetail(id: number): Promise<InvoiceDetailDTO | null> {
        if (!(id > 0)) return null;

        const invoice = await this._invoiceRepo.findOneBy({ id, is_deleted: 0 });
        if (!invoice) return null;

        const user = await this._userRepo.findOneBy({ username: invoice.created_by });
        if (!user) return null;

        const invProdList = await this._invoiceProductRepo.findBy({ invoice_id: invoice.id });
        if (!Helpers.isFilledArray(invProdList)) return null;

        const invProdDTOList = invProdList
            .filter((prod) => prod.product_weight > 0)
            .map((invProd) => mapper.map(invProd, InvoiceProductEntity, InvoiceProductDTO));

        const result = new InvoiceDetailDTO();
        result.id = invoice.id;
        result.customer_id = invoice.customer_id;
        result.customer_name = invoice.customer_name;
        result.total_weight = invoice.total_weight;
        result.total_price = invoice.total_price;
        result.is_paid = invoice.is_paid;
        result.is_deleted = invoice.is_deleted;
        result.created_by = invoice.created_by;
        result.created_date = Helpers.formatDate(invoice.created_date);
        result.updated_date = Helpers.formatDate(invoice.updated_date);
        result.weight_grid = JSON.parse(invoice.weight_grid) as InvoiceDetailDTO['weight_grid'];
        result.product_list = invProdDTOList;
        result.user_name = user.name;

        return result;
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

    public async getDateStatsList(params: { start_date: string; end_date: string; page?: number }) {
        const query = this._invoiceRepo
            .createQueryBuilder('invoice')
            .select('DATE_FORMAT(invoice.created_date, \'%d/%m/%Y\') as date')
            .addSelect('IFNULL(SUM(invoice.total_weight), 0) as total_weight')
            .addSelect('IFNULL(SUM(invoice.total_price), 0) as total_price')
            .where('invoice.is_deleted = 0');

        if (Helpers.isString(params.start_date)) {
            query.andWhere('invoice.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.andWhere('invoice.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
        }

        query.groupBy('DATE_FORMAT(invoice.created_date, \'%d/%m/%Y\')').orderBy('date', 'DESC');

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        const result = await query.getRawMany<InvoiceDateStatsDTO>();
        return Helpers.isFilledArray(result) ? result : [];
    }

    public async getCustomerList() {
        const invoiceList = await this._invoiceRepo.find();
        return invoiceList.map((inv) => mapper.map(inv, InvoiceEntity, CustomerDTO));
    }

    public async getDateStatsCount(params: { start_date: string; end_date: string; page?: number }) {
        const query = this._invoiceRepo
            .createQueryBuilder('invoice')
            .select('DATE_FORMAT(invoice.created_date, \'%d/%m/%Y\') as date')
            .addSelect('IFNULL(SUM(invoice.total_weight), 0) as total_weight')
            .addSelect('IFNULL(SUM(invoice.total_price), 0) as total_price')
            .where('invoice.is_deleted = 0');

        if (Helpers.isString(params.start_date)) {
            query.andWhere('invoice.created_date >= :start_date', { start_date: `${params.start_date} 00:00:00` });
        }

        if (Helpers.isString(params.end_date)) {
            query.andWhere('invoice.created_date <= :end_date', { end_date: `${params.end_date} 23:59:59` });
        }

        query.groupBy('DATE_FORMAT(invoice.created_date, \'%d/%m/%Y\')');

        return await query.getCount();
    }
}
