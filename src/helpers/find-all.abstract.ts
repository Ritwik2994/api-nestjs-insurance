import { HelpersService } from './helpers.service';
import { Model, Document } from 'mongoose';

interface FindAllDto {
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  limit: number;
  search?: string;
  nextPageToken?: string;
}

interface FindAllResponse<T> {
  nextPageToken: string;
  results: T[];
}

export abstract class BaseCrudService<T extends Document> {
  constructor(private readonly model: Model<T>, private readonly helperService: HelpersService) {}

  async findAll(findAllDto: FindAllDto): Promise<FindAllResponse<T>> {
    const { sortField, sortOrder, limit, search, nextPageToken } = findAllDto;
    const { query } = await this.helperService.makeQuery(nextPageToken);
    const sortCriteria = {};

    if (search) {
      const searchQuery = this.helperService.searchData(search);
      query['$or'] = [{ email: searchQuery }, { name: searchQuery }];
    }

    if (sortField) sortCriteria[sortField] = sortOrder || 'asc';

    const currentPageDocuments = await this.model
      .find(query)
      .sort(sortField ? sortCriteria : { createdAt: 'desc' })
      .limit(limit + 1);

    const nextPageDocuments = currentPageDocuments.slice(0, limit);
    const nextPageEncToken = await this.helperService.generateNextPageToken(currentPageDocuments, limit);

    return {
      nextPageToken: nextPageEncToken,
      results: nextPageDocuments
    };
  }
}
