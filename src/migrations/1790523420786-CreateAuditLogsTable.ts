import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1790523420786 implements MigrationInterface {
  name = 'CreateAuditLogsTable1790523420786';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" SERIAL NOT NULL, "action" character varying(100) NOT NULL, "entity_type" character varying(100), "entity_id" character varying(255), "actor_id" character varying(255), "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
