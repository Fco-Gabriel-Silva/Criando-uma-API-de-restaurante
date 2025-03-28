import { NextFunction, Request, Response } from "express";
import { knex } from "@/database/knex";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

class ProductController {
  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const { name } = request.query;
      const products = await knex<ProductRepository>("products")
        .select()
        .whereLike("name", `%${name ?? ""}%`)
        .orderBy("name");

      return response.json(products);
    } catch (error) {
      next(error);
    }
  }

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        name: z.string().trim().min(6),
        price: z.number().gt(0),
      });

      const { name, price } = bodySchema.parse(request.body);

      await knex<ProductRepository>("products").insert({ name, price });

      return response.status(201).json();
    } catch (error) {
      next(error);
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const id = z
        // O parâmetro id que vem da URL é esperado como uma string.
        .string()
        // O 'transform' é usado para converter o valor da string para um número.
        .transform((value) => Number(value))
        // O 'refine' verifica se o valor final após a transformação não é 'NaN'.
        // Isso é importante porque a conversão de uma string para número pode falhar se a string não for um número válido.]
        // Se o valor for inválido, ele lança uma mensagem de erro com a frase "id must be a number".
        .refine((value) => !isNaN(value), { message: "id must be a number" })
        // O 'parse' verifica se o valor atende ao esquema definido.
        // Se o valor for válido, ele é retornado; caso contrário, ele lança um erro de validação.
        .parse(request.params.id);

      const bodySchema = z.object({
        name: z.string().trim().min(6),
        price: z.number().gt(0),
      });

      // O 'parse'  tenta validar o valor fornecido contra o esquema que você definiu.
      // Se os dados forem válidos, ele retorna o valor.
      // Se os dados não passarem na validação, o Zod lança um erro!
      const { name, price } = bodySchema.parse(request.body);

      const product = await knex<ProductRepository>("products")
        .select()
        .where({ id })
        // '.first()': retorna somente o primeiro resultado da lista.
        .first();

      if (!product) {
        throw new AppError("product not found.");
      }

      await knex<ProductRepository>("products")
        .update({ name, price, updated_at: knex.fn.now() })
        .where({ id });

      return response.json({ message: "update" });
    } catch (error) {
      next(error);
    }
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    try {
      const id = z
        // O parâmetro id que vem da URL é esperado como uma string.
        .string()
        // O 'transform' é usado para converter o valor da string para um número.
        .transform((value) => Number(value))
        // O 'refine' verifica se o valor final após a transformação não é 'NaN'.
        // Isso é importante porque a conversão de uma string para número pode falhar se a string não for um número válido.]
        // Se o valor for inválido, ele lança uma mensagem de erro com a frase "id must be a number".
        .refine((value) => !isNaN(value), { message: "id must be a number" })
        // O 'parse' verifica se o valor atende ao esquema definido.
        // Se o valor for válido, ele é retornado; caso contrário, ele lança um erro de validação.
        .parse(request.params.id);

      const product = await knex<ProductRepository>("products")
        .select()
        .where({ id })
        // '.first()': retorna somente o primeiro resultado da lista.
        .first();

      if (!product) {
        throw new AppError("product not found.");
      }

      await knex<ProductRepository>("products").delete().where({ id });

      return response.json();
    } catch (error) {
      next(error);
    }
  }
}

export { ProductController };
