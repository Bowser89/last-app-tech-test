import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEntity } from '../entities';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(TableEntity)
    private tableRepository: Repository<TableEntity>,
  ) {}

  async onModuleInit() {
    console.log('Running Seeder...');

    const tableCount = await this.tableRepository.count();
    if (tableCount === 0) {
      await this.seedTables();
    }

    console.log('Seeder completed.');
  }

  private async seedTables() {
    const tables = [
      { capacity: 2 },
      { capacity: 4 },
      { capacity: 6 },
      { capacity: 8 },
    ];

    await this.tableRepository.insert(tables);
    console.log('Tables seeded.');
  }
}
