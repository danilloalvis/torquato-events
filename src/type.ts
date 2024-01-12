type Primitive = null | undefined | string | number | boolean | symbol | bigint
type BrowserNativeObject = Date | FileList | File

type IsEqual<T1, T2> = T1 extends T2
    ? (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
    ? true
    : false
    : false

type ArrayKey = number

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true
type TupleKeys<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>

type AnyIsEqual<T1, T2> = T1 extends T2 ? (IsEqual<T1, T2> extends true ? true : never) : never

type PathImpl<K extends string | number, V, TraversedTypes> = V extends Primitive | BrowserNativeObject
    ? `${K}`
    : true extends AnyIsEqual<TraversedTypes, V>
    ? `${K}`
    : `${K}` | `${K}.${PathInternal<V, TraversedTypes | V>}`

type PathInternal<T, TraversedTypes = T> = T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: PathImpl<K & string, T[K], TraversedTypes>
    }[TupleKeys<T>]
    : PathImpl<ArrayKey, V, TraversedTypes>
    : {
        [K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes>
    }[keyof T]


type Path<T> = T extends any ? PathInternal<T> : never

type IsAny<T> = 0 extends 1 & T ? true : false

type ArrayPathImpl<K extends string | number, V, TraversedTypes> = V extends Primitive | BrowserNativeObject
    ? IsAny<V> extends true
    ? string
    : never
    : V extends ReadonlyArray<infer U>
    ? U extends Primitive | BrowserNativeObject
    ? IsAny<V> extends true
    ? string
    : never
    : true extends AnyIsEqual<TraversedTypes, V>
    ? never
    : `${K}` | `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`
    : true extends AnyIsEqual<TraversedTypes, V>
    ? never
    : `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`

type ArrayPathInternal<T, TraversedTypes = T> = T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>
    }[TupleKeys<T>]
    : ArrayPathImpl<ArrayKey, V, TraversedTypes>
    : {
        [K in keyof T]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>
    }[keyof T]

type ArrayPath<T> = T extends any ? ArrayPathInternal<T> : never

export type FieldValues = Record<string, any>

export type PathValue<T, P extends Path<T> | ArrayPath<T> | string> = T extends any
    ? P extends `${infer K}.${infer R}`
    ? K extends keyof T
    ? R extends Path<T[K]>
    ? PathValue<T[K], R>
    : never
    : K extends `${ArrayKey}`
    ? T extends ReadonlyArray<infer V>
    ? PathValue<V, R & Path<V>>
    : never
    : never
    : P extends keyof T
    ? T[P]
    : P extends `${ArrayKey}`
    ? T extends ReadonlyArray<infer V>
    ? V
    : never
    : never
    : never

export type NestedKeyOf<T> = T extends any ? PathInternal<T> : never
