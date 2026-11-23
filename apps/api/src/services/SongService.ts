import type {
  CreateSongDto,
  SongCreatedResponseDto,
  SongDetailDto,
  SongSummaryDto,
  UpdateSongDto,
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
}
