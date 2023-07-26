import { AutoMap } from '@automapper/classes';
import { CONSTANTS, Helpers } from 'src/utils';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('d_invoices')
export class InvoiceEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        customer_id: string;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        customer_name: string;

    @Column({ type: 'text' })
    @AutoMap()
        weight_grid: string;

    @Column({ type: 'text' })
    @AutoMap()
        product_list: string;

    @Column({ type: 'decimal', precision: 15, scale: 3 })
    @AutoMap()
        total_weight: number;

    @Column({ type: 'decimal', precision: 15, scale: 0 })
    @AutoMap()
        total_price: number;

    @Column({ type: 'tinyint', default: 1 })
    @AutoMap()
        is_paid: 0 | 1;

    @Column({ type: 'tinyint', default: 0 })
    @AutoMap()
        is_deleted: 0 | 1;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        created_by: string;

    @CreateDateColumn({ type: 'datetime' })
    @AutoMap()
        created_date: string;

    @UpdateDateColumn({ type: 'datetime' })
    @AutoMap()
        updated_date: string;

    @BeforeInsert()
    beforeInsert() {
        this.created_date = Helpers.formatDate(new Date(), CONSTANTS.MYSQL_DATETIME_FORMAT);
        this.updated_date = Helpers.formatDate(new Date(), CONSTANTS.MYSQL_DATETIME_FORMAT);
    }

    @BeforeUpdate()
    beforeUpdate() {
        this.updated_date = Helpers.formatDate(new Date(), CONSTANTS.MYSQL_DATETIME_FORMAT);
    }
}
