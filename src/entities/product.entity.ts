import { AutoMap } from '@automapper/classes';
import { CONSTANTS, Helpers } from 'src/utils';
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('d_products')
export class ProductEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    @AutoMap()
        id: number;

    @Column({ type: 'varchar', length: 255 })
    @AutoMap()
        name: string;

    @Column({ type: 'decimal', precision: 15, scale: 0 })
    @AutoMap()
        price: number;

    @Column({ type: 'tinyint' })
    @AutoMap()
        order: number;

    @Column({ type: 'tinyint', default: 0 })
    @AutoMap()
        is_original: 0 | 1;

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
        this.created_date = Helpers.formatDate(new Date(), CONSTANTS.MYSQL_DATETIME_FORMAT);
        this.updated_date = Helpers.formatDate(new Date(), CONSTANTS.MYSQL_DATETIME_FORMAT);
    }

    @BeforeUpdate()
    beforeUpdate() {
        this.updated_date = Helpers.formatDate(new Date(), CONSTANTS.MYSQL_DATETIME_FORMAT);
    }
}
