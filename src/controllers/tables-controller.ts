import { Request, Response, NextFunction } from "express";
import { knex } from "@/database/knex";

class TablesController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const tables = await knex<TableRespository>("tables")
        .select()
        .orderBy("table_number");

      response.json(tables);
    } catch (error) {
      next(error);
    }
  }
}

export { TablesController };
