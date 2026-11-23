import {
  type CatalogueExportDto,
  type CatalogueImportResultDto,
  type CreateSongDto,
  type SongCreatedResponseDto,
  type SongDetailDto,
  SongDetailDtoSchema,
  type SongSummaryDto,
  type UpdateSongDto,
} from "@yourstruly/contracts";
import type { ISongRepository } from "@yourstruly/db";
import { TokenHashService } from "./TokenHashService";

export class SongService {
  private readonly songRepo: ISongRepository;
  private readonly tokenService: TokenHashService;

  constructor(songRepo: ISongRepository, tokenService?: TokenHashService) {
    this.songRepo = songRepo;
    this.tokenService = tokenService ?? new TokenHashService();
  }

  public async getSong(id: string): Promise<SongDetailDto | null> {
    return this.songRepo.findById(id);
  }

  public async listSongs(limit = 50, offset = 0): Promise<SongSummaryDto[]> {
    return this.songRepo.findAll(limit, offset);
  }

  public async createSong(dto: CreateSongDto): Promise<SongCreatedResponseDto> {
    const rawToken = this.tokenService.generateToken();
    const tokenHash = this.tokenService.hashToken(rawToken);

    const { song } = await this.songRepo.create(dto, tokenHash);
    return {
      song,
      editToken: rawToken,
    };
  }

  public async updateSong(id: string, dto: UpdateSongDto): Promise<SongDetailDto> {
    const expectedHash = await this.songRepo.getEditTokenHash(id);
    if (!expectedHash) {
      throw new Error("Song not found");
    }

    const isValid = this.tokenService.verifyToken(dto.editToken, expectedHash);
    if (!isValid) {
      throw new Error("Unauthorized: Invalid edit token");
    }

    return this.songRepo.update(id, dto);
  }

  public async recordPlay(id: string): Promise<void> {
    await this.songRepo.incrementPlayCount(id);
  }

  public async deleteSong(id: string, editToken?: string): Promise<boolean> {
    const expectedHash = await this.songRepo.getEditTokenHash(id);
    if (!expectedHash) {
      throw new Error("Song not found");
    }

    if (editToken) {
      const isValid = this.tokenService.verifyToken(editToken, expectedHash);
      if (!isValid) {
        throw new Error("Unauthorized: Invalid edit token");
      }
    }

    return this.songRepo.delete(id);
  }

  public async exportCatalogue(): Promise<CatalogueExportDto> {
    const songs = await this.songRepo.exportAll();
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      songs,
    };
  }

  public async importCatalogue(payload: unknown): Promise<CatalogueImportResultDto> {
    const rawList = Array.isArray(payload) ? payload : (payload as { songs?: unknown[] })?.songs;
    if (!Array.isArray(rawList)) {
      throw new Error("Expected an array of songs or { songs: [...] }");
    }

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of rawList) {
      const parsed = SongDetailDtoSchema.safeParse(item);
      if (!parsed.success) {
        errors.push(`Validation failed for ${(item as { title?: string })?.title ?? "item"}`);
        skippedCount++;
        continue;
      }
      const token = this.tokenService.generateToken();
      const hash = this.tokenService.hashToken(token);
      await this.songRepo.upsert(parsed.data, hash);
      importedCount++;
    }

    return { importedCount, skippedCount, errors };
  }
}
