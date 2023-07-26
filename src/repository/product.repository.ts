import { Injectable } from '@nestjs/common';
import { ProductEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(ProductEntity, _dataSource.createEntityManager());
    }
}
