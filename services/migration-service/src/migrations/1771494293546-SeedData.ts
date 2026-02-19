import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedData1771494293546 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const users = await queryRunner.query(`INSERT INTO "user"("name") VALUES ('Oom'), ('Mam')`);
        await queryRunner.query(`INSERT INTO "product"("name", "price") VALUES ('Laptop', 1200.00), ('Phone', 800.00), ('Tablet', 600.00)`);
        await queryRunner.query(`INSERT INTO "order"("quantity", "userId", "productId") VALUES (2, 1, 1), (1, 2, 2)`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
