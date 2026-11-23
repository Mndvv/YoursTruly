import type {
  CreateSongDto,
  SongDetailDto,
  SongSummaryDto,
  UpdateSongDto,
} from "@yourstruly/contracts";

export interface ISongRepository {
  findById(id: string): Promise<SongDetailDto | null>;
  findAll(limit?: number, offset?: number): Promise<SongSummaryDto[]>;
  exportAll(): Promise<SongDetailDto[]>;
  create(song: CreateSongDto, editTokenHash: string): Promise<{ song: SongDetailDto; id: string }>;
  update(id: string, data: UpdateSongDto): Promise<SongDetailDto>;
  upsert(song: SongDetailDto, editTokenHash: string): Promise<void>;
  incrementPlayCount(id: string): Promise<void>;
  getEditTokenHash(id: string): Promise<string | null>;
  delete(id: string): Promise<boolean>;
}
