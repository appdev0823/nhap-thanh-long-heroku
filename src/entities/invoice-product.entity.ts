import { AutoMap } from '@automapper/classes';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('d_invoice_products')
export class InvoiceProductEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'bigint' })
    @AutoMap()
        invoice_id: number;

    @Column({ type: 'bigint' })
    @AutoMap()
        product_id: number;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        product_name: string;

    @Column({ type: 'decimal', precision: 15, scale: 0 })
    @AutoMap()
        product_price: number;

    @Column({ type: 'tinyint' })
    @AutoMap()
        product_order: number;

    @Column({ type: 'decimal', precision: 15, scale: 3 })
    @AutoMap()
        product_weight: number;

    @Column({ type: 'text' })
    @AutoMap()
        product_weight_list: string;

    @Column({ type: 'tinyint', default: 0 })
    @AutoMap()
        product_is_original: 0 | 1;

    @Column({ type: 'tinyint', default: 0 })
    @AutoMap()
        is_deleted: 0 | 1;

    @CreateDateColumn({ type: 'datetime' })
    @AutoMap()
        created_date: string;

    @UpdateDateColumn({ type: 'datetime' })
    @AutoMap()
        updated_date: string;

    @BeforeInsert()
    beforeInsert() {
        this.created_date = new Date().toISOString();
        this.updated_date = new Date().toISOString();
    }

    @BeforeUpdate()
    beforeUpdate() {
        this.updated_date = new Date().toISOString();
    }
}
