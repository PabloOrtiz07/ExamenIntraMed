import 'reflect-metadata';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../../auth/presentation/decorators/roles.decorator';
import { CreateMovieUseCase } from '../application/create-movie.use-case';
import { DeleteMovieUseCase } from '../application/delete-movie.use-case';
import { GetMovieUseCase } from '../application/get-movie.use-case';
import { ListMoviesUseCase } from '../application/list-movies.use-case';
import { UpdateMovieUseCase } from '../application/update-movie.use-case';
import { Movie } from '../domain/movie.entity';
import { MoviesController } from './movies.controller';

const useCaseMock = <T>() => ({ execute: jest.fn() }) as unknown as jest.Mocked<T>;

const movie = new Movie(
  'id-1',
  'A New Hope',
  4,
  'crawl',
  'George Lucas',
  'Gary Kurtz',
  new Date('1977-05-25'),
  null,
);

describe('MoviesController', () => {
  let list: jest.Mocked<ListMoviesUseCase>;
  let get: jest.Mocked<GetMovieUseCase>;
  let create: jest.Mocked<CreateMovieUseCase>;
  let update: jest.Mocked<UpdateMovieUseCase>;
  let remove: jest.Mocked<DeleteMovieUseCase>;
  let controller: MoviesController;

  beforeEach(() => {
    list = useCaseMock<ListMoviesUseCase>();
    get = useCaseMock<GetMovieUseCase>();
    create = useCaseMock<CreateMovieUseCase>();
    update = useCaseMock<UpdateMovieUseCase>();
    remove = useCaseMock<DeleteMovieUseCase>();
    controller = new MoviesController(list, get, create, update, remove);
  });

  it('list returns response DTOs with the date as YYYY-MM-DD', async () => {
    list.execute.mockResolvedValue([movie]);

    const result = await controller.list();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'id-1', title: 'A New Hope', releaseDate: '1977-05-25' });
  });

  it('detail delegates to the use case and maps the result', async () => {
    get.execute.mockResolvedValue(movie);
    const result = await controller.detail('id-1');
    expect(get.execute).toHaveBeenCalledWith('id-1');
    expect(result.title).toBe('A New Hope');
  });

  it('remove delegates to the use case', async () => {
    remove.execute.mockResolvedValue(undefined);
    await controller.remove('id-1');
    expect(remove.execute).toHaveBeenCalledWith('id-1');
  });

  describe('role restrictions required by the brief', () => {
    const rolesOf = (handler: unknown) => Reflect.getMetadata(ROLES_KEY, handler as object);
    const proto = MoviesController.prototype;

    it('lets only admins create, update and delete movies', () => {
      expect(rolesOf(proto.create)).toEqual([Role.ADMIN]);
      expect(rolesOf(proto.update)).toEqual([Role.ADMIN]);
      expect(rolesOf(proto.remove)).toEqual([Role.ADMIN]);
    });

    it('lets regular users and admins see the details (decision B)', () => {
      expect(rolesOf(proto.detail)).toEqual([Role.REGULAR, Role.ADMIN]);
    });

    it('keeps the list public (no roles metadata)', () => {
      expect(rolesOf(proto.list)).toBeUndefined();
    });
  });
});