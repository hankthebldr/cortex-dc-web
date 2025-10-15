/**
 * PostgreSQL Adapter using Prisma
 * Implements DatabaseAdapter interface for PostgreSQL database
 */

import { PrismaClient } from '@prisma/client';
import {
  DatabaseAdapter,
  DatabaseTransaction,
  QueryOptions,
  QueryFilter,
} from './database.adapter';

export class PostgresAdapter implements DatabaseAdapter {
  private prisma: PrismaClient;
  private connected: boolean = false;

  constructor(databaseUrl?: string) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl || process.env.DATABASE_URL,
        },
      },
    });
  }

  async connect(): Promise<void> {
    await this.prisma.$connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private getModel(collection: string): any {
    const modelName = this.collectionToModelName(collection);
    return (this.prisma as any)[modelName];
  }

  private collectionToModelName(collection: string): string {
    // Convert collection names to Prisma model names
    const mapping: Record<string, string> = {
      users: 'user',
      povs: 'pOV',
      trrs: 'tRR',
      activityLogs: 'activityLog',
      loginEvents: 'loginEvent',
      userSessions: 'userSession',
      dataImportJobs: 'dataImportJob',
      stagingRecords: 'stagingRecord',
      dataMigrationLogs: 'dataMigrationLog',
    };
    return mapping[collection] || collection;
  }

  private buildWhereClause(options?: QueryOptions): any {
    if (!options?.filters || options.filters.length === 0) {
      return {};
    }

    const where: any = {};

    options.filters.forEach((filter: QueryFilter) => {
      switch (filter.operator) {
        case '==':
          where[filter.field] = filter.value;
          break;
        case '!=':
          where[filter.field] = { not: filter.value };
          break;
        case '>':
          where[filter.field] = { gt: filter.value };
          break;
        case '<':
          where[filter.field] = { lt: filter.value };
          break;
        case '>=':
          where[filter.field] = { gte: filter.value };
          break;
        case '<=':
          where[filter.field] = { lte: filter.value };
          break;
        case 'in':
          where[filter.field] = { in: filter.value };
          break;
        case 'array-contains':
          where[filter.field] = { has: filter.value };
          break;
      }
    });

    return where;
  }

  async findMany<T>(collection: string, options?: QueryOptions): Promise<T[]> {
    const model = this.getModel(collection);
    const where = this.buildWhereClause(options);

    const query: any = { where };

    if (options?.limit) {
      query.take = options.limit;
    }

    if (options?.offset) {
      query.skip = options.offset;
    }

    if (options?.orderBy) {
      query.orderBy = {
        [options.orderBy]: options.orderDirection || 'asc',
      };
    }

    return await model.findMany(query);
  }

  async findOne<T>(collection: string, id: string): Promise<T | null> {
    const model = this.getModel(collection);
    return await model.findUnique({
      where: { id },
    });
  }

  async findByField<T>(
    collection: string,
    field: string,
    value: any
  ): Promise<T | null> {
    const model = this.getModel(collection);
    return await model.findFirst({
      where: { [field]: value },
    });
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const model = this.getModel(collection);
    return await model.create({
      data,
    });
  }

  async update<T>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const model = this.getModel(collection);
    return await model.update({
      where: { id },
      data,
    });
  }

  async delete(collection: string, id: string): Promise<void> {
    const model = this.getModel(collection);
    await model.delete({
      where: { id },
    });
  }

  async createMany<T>(collection: string, data: Partial<T>[]): Promise<T[]> {
    const model = this.getModel(collection);

    // Prisma createMany doesn't return created records by default
    // So we need to create them one by one
    const created: T[] = [];
    for (const item of data) {
      const result = await model.create({ data: item });
      created.push(result);
    }

    return created;
  }

  async updateMany(
    collection: string,
    ids: string[],
    data: any
  ): Promise<void> {
    const model = this.getModel(collection);
    await model.updateMany({
      where: { id: { in: ids } },
      data,
    });
  }

  async deleteMany(collection: string, ids: string[]): Promise<void> {
    const model = this.getModel(collection);
    await model.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async transaction<T>(
    callback: (tx: DatabaseTransaction) => Promise<T>
  ): Promise<T> {
    return await this.prisma.$transaction(async (prisma: any) => {
      const tx: DatabaseTransaction = {
        findOne: async <T>(collection: string, id: string): Promise<T | null> => {
          const modelName = this.collectionToModelName(collection);
          return await (prisma as any)[modelName].findUnique({
            where: { id },
          });
        },

        create: async <T>(collection: string, data: Partial<T>): Promise<T> => {
          const modelName = this.collectionToModelName(collection);
          return await (prisma as any)[modelName].create({
            data,
          });
        },

        update: async <T>(
          collection: string,
          id: string,
          data: Partial<T>
        ): Promise<T> => {
          const modelName = this.collectionToModelName(collection);
          return await (prisma as any)[modelName].update({
            where: { id },
            data,
          });
        },

        delete: async (collection: string, id: string): Promise<void> => {
          const modelName = this.collectionToModelName(collection);
          await (prisma as any)[modelName].delete({
            where: { id },
          });
        },
      };

      return await callback(tx);
    });
  }

  async exists(collection: string, id: string): Promise<boolean> {
    const model = this.getModel(collection);
    const count = await model.count({
      where: { id },
    });
    return count > 0;
  }

  async count(collection: string, options?: QueryOptions): Promise<number> {
    const model = this.getModel(collection);
    const where = this.buildWhereClause(options);
    return await model.count({ where });
  }
}

// Singleton instance
let postgresInstance: PostgresAdapter | null = null;

export function getPostgresAdapter(): PostgresAdapter {
  if (!postgresInstance) {
    postgresInstance = new PostgresAdapter();
  }
  return postgresInstance;
}
