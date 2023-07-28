import { AutoMap } from '@automapper/classes';

export class ProductDTO {
    @AutoMap() id: number;
    @AutoMap() name: string;
    @AutoMap() price: number;
    @AutoMap() order: number;
    @AutoMap() is_original: 0 | 1;
    @AutoMap() is_deleted: 0 | 1;
    @AutoMap() created_date: string;
    @AutoMap() updated_date: string;
}

export class ProductStatsDTO extends ProductDTO {
    total_weight: number;
}
