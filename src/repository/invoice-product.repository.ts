import { Injectable } from '@nestjs/common';
import { InvoiceProductEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class InvoiceProductRepository extends Repository<InvoiceProductEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(InvoiceProductEntity, _dataSource.createEntityManager());
    }
}
