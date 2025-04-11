type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type BrowserNativeObject = Date | FileList | File;
type IsEqual<T1, T2> = T1 extends T2 ? (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2 ? true : false : false;
type ArrayKey = number;
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;
type TupleKeys<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
type AnyIsEqual<T1, T2> = T1 extends T2 ? (IsEqual<T1, T2> extends true ? true : never) : never;
type PathImpl<K extends string | number, V, TraversedTypes> = V extends Primitive | BrowserNativeObject ? `${K}` : true extends AnyIsEqual<TraversedTypes, V> ? `${K}` : `${K}` | `${K}.${PathInternal<V, TraversedTypes | V>}`;
type PathInternal<T, TraversedTypes = T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
    [K in TupleKeys<T>]-?: PathImpl<K & string, T[K], TraversedTypes>;
}[TupleKeys<T>] : PathImpl<ArrayKey, V, TraversedTypes> : {
    [K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes>;
}[keyof T];
type Path<T> = T extends any ? PathInternal<T> : never;
type IsAny<T> = 0 extends 1 & T ? true : false;
type ArrayPathImpl<K extends string | number, V, TraversedTypes> = V extends Primitive | BrowserNativeObject ? IsAny<V> extends true ? string : never : V extends ReadonlyArray<infer U> ? U extends Primitive | BrowserNativeObject ? IsAny<V> extends true ? string : never : true extends AnyIsEqual<TraversedTypes, V> ? never : `${K}` | `${K}.${ArrayPathInternal<V, TraversedTypes | V>}` : true extends AnyIsEqual<TraversedTypes, V> ? never : `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`;
type ArrayPathInternal<T, TraversedTypes = T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
    [K in TupleKeys<T>]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
}[TupleKeys<T>] : ArrayPathImpl<ArrayKey, V, TraversedTypes> : {
    [K in keyof T]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
}[keyof T];
type ArrayPath<T> = T extends any ? ArrayPathInternal<T> : never;
type FieldValues = Record<string, any>;
type PathValue<T, P extends Path<T> | ArrayPath<T> | string> = T extends any ? P extends `${infer K}.${infer R}` ? K extends keyof T ? R extends Path<T[K]> ? PathValue<T[K], R> : never : K extends `${ArrayKey}` ? T extends ReadonlyArray<infer V> ? PathValue<V, R & Path<V>> : never : never : P extends keyof T ? T[P] : P extends `${ArrayKey}` ? T extends ReadonlyArray<infer V> ? V : never : never : never;

type Subscriber<T, K extends string> = (payload?: PathValue<T, K>) => Promise<void> | void;
type SubscriberGlobal<K extends string> = (event: K, payload?: any) => Promise<void> | void;
type SubscriberIdentifier<T, K extends string> = (event: K, payload?: PathValue<T, K>) => Promise<void> | void;
type Sub<T, K extends string> = {
    [key: string]: Subscriber<T, K> | SubscriberIdentifier<T, K> | SubscriberGlobal<K>;
};
type Listener<T, K extends string> = {
    [key: string]: Sub<T, K>;
};
type Unsubscribe = {
    unsubscribe: () => void;
};
type Params = {
    throwOnFailure?: boolean;
    storage?: boolean;
    enableLogs?: boolean;
    autoClearValue?: boolean;
    autoClearEvents?: boolean;
};
type SubscribeOptions = {
    debounce?: number;
    runOnCreate?: boolean;
};
declare class Sinal<K extends string, T = FieldValues> {
    private Events;
    private Payload;
    private throwOnFailure;
    private storage;
    private enableLogs;
    private autoClearValue;
    private autoClearEvents;
    private subscribers;
    constructor(params?: Params);
    subscribe<A extends string = K>(event: A, subscriber: Subscriber<T, A>, options?: SubscribeOptions): Unsubscribe;
    onChange(subscriber: SubscriberGlobal<K>): Unsubscribe;
    getValue<A extends string = K>(event: A): PathValue<T, A> | any | undefined;
    getSubscribers(): {
        value?: Partial<T> | undefined;
        listeners: Listener<T, K>;
        onChange: Listener<T, K>;
    };
    register<A extends string = K>(event: A, payload?: PathValue<T, A> | {}): void;
    dispatch<A extends string = K>(event: A, payload?: PathValue<T, A> | {}): Promise<void>;
    dispatchOnChange<A extends string = K>(event: A, payload?: PathValue<T, A> | {}): Promise<void>;
    remove<A extends string = K>(event: A, keepValue?: boolean): void;
    clear(): void;
    private unsubscribe;
    private unsubscribeOnChange;
}

export { Sinal as default };
