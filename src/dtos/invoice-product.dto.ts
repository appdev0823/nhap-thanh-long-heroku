import { AutoMap } from '@automapper/classes';

export class InvoiceProductDTO {
    @AutoMap() id: number;
    @AutoMap() invoice_id: number;
    @AutoMap() product_id: number;
    @AutoMap() product_name: string;
    @AutoMap() product_price: number;
    @AutoMap() product_order: number;
    @AutoMap() product_weight: number;
    @AutoMap() product_weight_list: string;
    @AutoMap() product_is_original: 0 | 1;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}
