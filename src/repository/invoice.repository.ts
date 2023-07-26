import { Injectable } from '@nestjs/common';
import { InvoiceEntity } from 'src/entities';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class InvoiceRepository extends Repository<InvoiceEntity> {
    /** Constructor */
    constructor(private readonly _dataSource: DataSource) {
        super(InvoiceEntity, _dataSource.createEntityManager());
    }
}
