import { Injectable } from '@nestjs/common';
import { ProductDTO } from 'src/dtos';
import { ProductEntity } from 'src/entities';
import { BaseService } from 'src/includes';
import { ProductRepository } from 'src/repository';
import { CONSTANTS, Helpers, mapper } from 'src/utils';
import { CommonSearchQuery } from 'src/utils/types';
import { In } from 'typeorm';

@Injectable()
export class ProductService extends BaseService {
    /** Constructor */
    constructor(private readonly _productRepo: ProductRepository) {
        super();
    }

    public async getList(params: CommonSearchQuery) {
        const query = this._productRepo.createQueryBuilder('product').where('product.is_deleted = 0').orderBy('product.order', 'ASC');

        if (Number(params?.page) > 0) {
            const page = Number(params?.page);
            const offset = (page - 1) * CONSTANTS.PAGE_SIZE;
            query.offset(offset).limit(CONSTANTS.PAGE_SIZE);
        }

        const list = await query.getMany();
        if (!Helpers.isFilledArray(list)) return [];

        return list.map((product) => mapper.map(product, ProductEntity, ProductDTO));
    }

    public async getTotal() {
        const query = this._productRepo.createQueryBuilder('product').where('product.is_deleted = 0');

        return query.getCount();
    }

    public async getDetail(id: number): Promise<ProductDTO | null> {
        if (!(id > 0)) return null;

        const item = await this._productRepo.findOneBy({ id });
        if (!item) return null;

        return mapper.map(item, ProductEntity, ProductDTO);
    }

    public async getById(id: number): Promise<ProductDTO | null> {
        if (!(id > 0)) return null;

        const item = await this._productRepo.findOneBy({ id });
        if (!item) return null;

        return mapper.map(item, ProductEntity, ProductDTO);
    }

    public async create(product: ProductDTO): Promise<ProductDTO | null> {
        if (Helpers.isEmptyObject(product)) return null;

        const productEntity = mapper.map(product, ProductDTO, ProductEntity);

        await this._productRepo.save(productEntity);

        return mapper.map(productEntity, ProductEntity, ProductDTO);
    }

    public async update(product: ProductDTO): Promise<ProductDTO | null> {
        if (Helpers.isEmptyObject(product)) return null;

        const entity = mapper.map(product, ProductDTO, ProductEntity);

        await this._productRepo.save(entity);

        return mapper.map(entity, ProductEntity, ProductDTO);
    }

    public async delete(id: number): Promise<ProductDTO | null> {
        if (!(id > 0)) return null;

        const item = await this._productRepo.findOneBy({ id });
        if (!item) return null;

        const entity = mapper.map(item, ProductEntity, ProductDTO);
        entity.is_deleted = 1;

        await this._productRepo.save(entity);

        return entity;
    }

    public async updateOrder(itemList: { id: number; order: number }[]) {
        if (!Helpers.isFilledArray(itemList)) return false;

        const idList = itemList.map((item) => item.id);

        const prodList = await this._productRepo.find({ where: { id: In(idList) } });
        if (!Helpers.isFilledArray(itemList)) return false;

        for (const prod of prodList) {
            const newOrder = itemList.find((item) => item.id === prod.id)?.order;
            prod.order = newOrder || 0;
        }

        await this._productRepo.save(prodList);

        return true;
    }
}
