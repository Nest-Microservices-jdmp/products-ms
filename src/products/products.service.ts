import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database Connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll({ limit, page }: PaginationDto) {
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit!);

    return {
      data: await this.product.findMany({
        where: { available: true },
        take: limit,
        skip: (page! - 1) * limit!,
      }),
      meta: {
        page,
        total: totalPages,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });
    if (!product) {
      throw new RpcException({
        message: `Product not found with id ${id}`,
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return product;
  }

  async update({ id, ...data }: UpdateProductDto) {
    await this.findOne(id);

    const updatedData = {
      ...data,
      price: data.price ? parseFloat(data.price.toString()) : undefined, // ✅ Convertir manualmente a Float
    };

    return await this.product.update({
      where: { id },
      data: updatedData,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.product.update({
      where: { id },
      data: { available: false },
    });
  }
}
