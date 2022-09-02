interface SourceCursor {
  source: string;
  index: number;
}

interface ContentToken {
  content: string;
}

interface StringToken {
  content: ContentToken;
  source: SourceCursor;
}

interface StringParserFactory<T> {
  parser: StringParser<T>;
  transform<T2>(
    transformer: (match: StringMatch<T>) => T2
  ): StringParserFactory<T2>;
  optional(): StringParserFactory<T>;
  many(): StringParserFactory<T[]>;
  times(minTimes: number, maxTimes?: number): StringParserFactory<T[]>;
  before<B>(factory: StringParserFactory<B>): StringParserFactory<[T, B]>;
}

type AllOf<T extends any[]> = T extends [infer A, ...infer R]
  ? A & AllOf<R>
  : never;
type OneOf<T extends any[]> = T extends (infer T2)[] ? T2 : never;

interface StringParserFactoryFactory {
  anyCharacter(): StringParserFactory<string>;
  whitespaceCharacter(): StringParserFactory<string>;
  digitCharacter(): StringParserFactory<string>;
  alphabetCharacter(): StringParserFactory<string>;
  beginning(): StringParserFactory<void>;
  ending(): StringParserFactory<void>;
  character<T extends string>(char: T): StringParserFactory<T>;
  characterRange(start: string, stop: string): StringParserFactory<string>;
  token<T extends string>(token: T): StringParserFactory<T>;
  allOf<T extends any[]>(...allOf: T): StringParserFactory<AllOf<T>>;
  oneOf<T extends any[]>(...oneOf: T): StringParserFactory<OneOf<T>>;
  position(): StringParserFactory<number>;
  ref<T extends StringParserFactory<any>>(factory: () => T): T;
  tuple<T extends [] | readonly any[]>(
    tupleMap: T
  ): StringParserFactory<{
    readonly [key in keyof T]: T[key] extends StringParserFactory<infer T2>
      ? T2
      : never;
  }>;
  props<T>(propertyMap: T): StringParserFactory<{
    [key in keyof T]: T[key] extends StringParserFactory<infer T2> ? T2 : never;
  }>;
  filter<T1, T2 extends T1>(
    filter: (match: StringMatch<T1>) => match is StringMatch<T2>
  ): StringParserFactory<T2>;
  map<T1, T2>(
    transformer: (match: StringMatch<T1>) => T2
  ): StringParserFactory<T2>;
}

const f = {} as StringParserFactoryFactory;
const sp0 = f.ref(() => sp1);
const sp1 = f.props({ position: f.position() });
const sp2 = f.ref(() => f.tuple([f.character("["), sp0, f.character("]")]));

interface StringMatch<T> {
  value: T;
  children: StringMatch<any>[];
}

interface StringParser<T> {
  parse(source: string): StringMatch<T>;
  parse(input: SourceCursor): StringMatch<T>;
}
