import {Cursor, CursorData} from './Cursor'
import {From} from './From'
import {OrderBy, OrderDirection} from './OrderBy'
import {ParamData, ParamType} from './Param'
import {Selection, SelectionData, SelectionInput} from './Selection'
import type {Store} from './Store'

export const enum UnOp {
  Not,
  IsNull
}

export const enum BinOp {
  Add,
  Subt,
  Mult,
  Mod,
  Div,
  Greater,
  GreaterOrEqual,
  Less,
  LessOrEqual,
  Equals,
  NotEquals,
  And,
  Or,
  Like,
  Glob,
  Match,
  In,
  NotIn,
  Concat
}

export const enum ExprType {
  UnOp,
  BinOp,
  Field,
  Param,
  Call,
  Access,
  Query
}

export type ExprData =
  | {type: ExprType.UnOp; op: UnOp; expr: ExprData}
  | {type: ExprType.BinOp; op: BinOp; a: ExprData; b: ExprData}
  | {type: ExprType.Field; from: From; field: string}
  | {type: ExprType.Access; expr: ExprData; field: string}
  | {type: ExprType.Param; param: ParamData}
  | {type: ExprType.Call; method: string; params: Array<ExprData>}
  | {type: ExprType.Query; cursor: CursorData}

export const ExprData = {
  UnOp(op: UnOp, expr: ExprData): ExprData {
    return {type: ExprType.UnOp, op: op, expr: expr}
  },
  BinOp(op: BinOp, a: ExprData, b: ExprData): ExprData {
    return {type: ExprType.BinOp, op: op, a: a, b: b}
  },
  Field(from: From, field: string): ExprData {
    return {type: ExprType.Field, from, field}
  },
  Param(param: ParamData): ExprData {
    return {type: ExprType.Param, param: param}
  },
  Call(method: string, params: Array<ExprData>): ExprData {
    return {type: ExprType.Call, method: method, params: params}
  },
  Access(expr: ExprData, field: string): ExprData {
    return {type: ExprType.Access, expr: expr, field: field}
  },
  Query(cursor: CursorData): ExprData {
    return {type: ExprType.Query, cursor: cursor}
  },
  create(input: any) {
    if (input == null) return ExprData.Param(ParamData.Value(null))
    if (input instanceof Expr) return input.expr
    if (input instanceof Cursor) return ExprData.Query(input.cursor)
    return ExprData.Param(ParamData.Value(input))
  }
}

const toExpr = ExprData.create

/** Expression or value of type T */
export type EV<T> = Expr<T> | T

function isConstant<T>(e: ExprData, value: T): boolean {
  switch (e.type) {
    case ExprType.Param:
      switch (e.param.type) {
        case ParamType.Value:
          return e.param.value == value
        default:
          return false
      }
    default:
      return false
  }
}

export class Expr<T> {
  static NULL = toExpr(null)

  static value<T>(value: T): Expr<T> {
    return new Expr(ExprData.Param(ParamData.Value(value)))
  }

  constructor(public expr: ExprData) {
    return new Proxy(this, {
      get(target: any, key) {
        return key in target ? target[key] : target.get(key)
      }
    })
  }

  asc(): OrderBy {
    return {expr: this.expr, order: OrderDirection.Asc}
  }

  desc(): OrderBy {
    return {expr: this.expr, order: OrderDirection.Desc}
  }

  not(): Expr<boolean> {
    return unop(this, UnOp.Not)
  }

  or(this: Expr<boolean>, that: EV<boolean>): Expr<boolean> {
    const a = this.expr
    const b = toExpr(that)
    if (isConstant(b, true) || isConstant(a, false)) return new Expr(b)
    if (isConstant(a, true) || isConstant(b, false)) return this
    return new Expr(ExprData.BinOp(BinOp.Or, a, b))
  }

  and(this: Expr<boolean>, that: EV<boolean>): Expr<boolean> {
    const a = this.expr
    const b = toExpr(that)
    if (isConstant(b, true) || isConstant(a, false)) return this
    if (isConstant(a, true) || isConstant(b, false)) return new Expr(b)
    return new Expr(ExprData.BinOp(BinOp.And, a, b))
  }

  isNull(): Expr<boolean> {
    return unop(this, UnOp.IsNull)
  }
  isNotNull(): Expr<boolean> {
    return this.isNull().not()
  }
  isNot(that: EV<T>): Expr<boolean> {
    if (that == null || (that instanceof Expr && isConstant(that.expr, null)))
      return this.isNotNull()
    return binop(this, BinOp.NotEquals, that)
  }
  is(that: EV<T>): Expr<boolean> {
    if (that === null || (that instanceof Expr && isConstant(that.expr, null)))
      return this.isNull()
    return binop(this, BinOp.Equals, that)
  }
  isIn(that: EV<Array<T>> | Cursor<any>): Expr<boolean> {
    return binop(this, BinOp.In, that)
  }
  isNotIn(that: EV<Array<T>> | Cursor<any>): Expr<boolean> {
    return binop(this, BinOp.NotIn, that)
  }
  add(this: Expr<number>, that: EV<number>): Expr<number> {
    return binop(this, BinOp.Add, that)
  }
  substract(this: Expr<number>, that: EV<number>): Expr<number> {
    return binop(this, BinOp.Subt, that)
  }
  multiply(this: Expr<number>, that: EV<number>): Expr<number> {
    return binop(this, BinOp.Mult, that)
  }
  remainder(this: Expr<number>, that: EV<number>): Expr<number> {
    return binop(this, BinOp.Mod, that)
  }
  divide(this: Expr<number>, that: EV<number>): Expr<number> {
    return binop(this, BinOp.Div, that)
  }
  greater(that: EV<any>): Expr<boolean> {
    return binop(this, BinOp.Greater, that)
  }
  greaterOrEqual(that: EV<any>): Expr<boolean> {
    return binop(this, BinOp.GreaterOrEqual, that)
  }
  less(that: EV<any>): Expr<boolean> {
    return binop(this, BinOp.Less, that)
  }
  lessOrEqual(that: EV<any>): Expr<boolean> {
    return binop(this, BinOp.LessOrEqual, that)
  }
  concat(this: Expr<string>, that: EV<string>): Expr<string> {
    return binop(this, BinOp.Concat, that)
  }
  like(this: Expr<string>, that: EV<string>): Expr<boolean> {
    return binop(this, BinOp.Like, that)
  }
  glob(this: Expr<string>, that: EV<string>): Expr<boolean> {
    return binop(this, BinOp.Glob, that)
  }
  match(this: Expr<string>, that: EV<string>): Expr<boolean> {
    return binop(this, BinOp.Match, that)
  }
  with<Row extends {}, X extends SelectionInput>(
    this: Expr<Row>,
    that: X
  ): Selection.With<Row, X> {
    return new Selection(SelectionData.Expr(this.expr)).with(that)
  }
  private static uniqueId = 0
  private __id() {
    return `__id${Expr.uniqueId++}`
  }
  each<T>(this: Expr<Array<T>>): Cursor<T> {
    const from = From.Each(this.expr, this.__id())
    return new Cursor({
      from,
      selection: SelectionData.Row(from)
    })
  }
  process<T, X>(this: Expr<T>, fn: (cursor: T) => X): Selection<X> {
    return new Selection(SelectionData.Process(this.expr, this.__id(), fn))
  }
  map<T, X extends SelectionInput>(
    this: Expr<Array<T>>,
    fn: (cursor: Cursor<T>) => X
  ): Selection<Array<Store.TypeOf<X>>> {
    const row = this.each()
    return row.select(fn(row)) as any
  }
  case<
    T extends string | number,
    C extends {[K in T]?: SelectionInput},
    DC extends SelectionInput
  >(
    this: Expr<T>,
    cases: C,
    defaultCase?: DC
  ): Selection<Store.TypeOf<C[keyof C]> | Store.TypeOf<DC>> {
    return new Selection(
      SelectionData.Case(
        this.expr,
        Object.fromEntries(
          Object.entries(cases).map(([k, v]) => [k, SelectionData.create(v)])
        ),
        defaultCase && SelectionData.create(defaultCase)
      )
    )
  }

  get<K extends keyof T>(name: K): Expr<T[K]> {
    return new Expr(ExprData.Access(this.expr, name as string))
  }

  static create<T>(input: EV<T>): Expr<T> {
    if (input instanceof Expr) return input
    return new Expr(ExprData.create(input))
  }
}

function unop<This, Res>(self: Expr<This>, type: UnOp) {
  return new Expr<Res>(ExprData.UnOp(type, self.expr))
}

function binop<This, That, Res>(self: Expr<This>, type: BinOp, that: EV<That>) {
  return new Expr<Res>(ExprData.BinOp(type, self.expr, toExpr(that)))
}
