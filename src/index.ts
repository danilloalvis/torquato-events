import { FieldValues, PathValue } from "./type"
import { generateHash } from "./utils"
import objectPath from 'object-path'

type Subscriber<T, K extends string> = (payload?: PathValue<T, K>) => Promise<void> | void
type SubscriberGlobal<K extends string> = (event: K, payload?: any) => Promise<void> | void
type SubscriberIdentifier<T, K extends string> = (event: K, payload?: PathValue<T, K>) => Promise<void> | void

type Sub<T, K extends string> = {
    [key: string]: Subscriber<T, K> | SubscriberIdentifier<T, K> | SubscriberGlobal<K>
}

type Listener<T, K extends string> = {
    [key: string]: Sub<T, K>
}
type Debouncer = {
    [key: string]: {
        [key: string]: {
            delay: number,
            timeout: NodeJS.Timeout
        }
    }
}

type Subscribers<T, K extends string> = {
    value?: Partial<T>
    listeners: Listener<T, K>
    onChange: Listener<T, K>
    debouncers: Debouncer
}

type Unsubscribe = {
    unsubscribe: () => void
}

type Params = {
    throwOnFailure?: boolean;
    storage?: boolean;
    enableLogs?: boolean
    autoClearValue?: boolean
    autoClearEvents?: boolean
}

type SubscribeOptions = {
    debounce?: number
    runOnCreate?: boolean
}

export default class Sinal<K extends string, T = FieldValues> {
    private Events!: K

    private Payload!: Partial<T>

    private throwOnFailure: boolean

    private storage: boolean

    private enableLogs: boolean

    private autoClearValue: boolean

    private autoClearEvents: boolean

    private initial: Subscribers<T, K> = {
        value: undefined,
        listeners: {},
        onChange: {},
        debouncers: {}
    }

    private subscribers: Subscribers<T, K>;



    constructor(params?: Params) {
        this.subscribers = this.initial
        this.throwOnFailure = !!params?.throwOnFailure
        this.storage = !!params?.storage
        this.enableLogs = !!params?.enableLogs
        this.autoClearValue = !!params?.autoClearValue
        this.autoClearEvents = !!params?.autoClearEvents
    }

    public subscribe<A extends string = K>(event: A, subscriber: Subscriber<T, A>, options?: SubscribeOptions): Unsubscribe {
        const hash = generateHash()

        objectPath.set(this.subscribers, `listeners.${event}.${hash}`, subscriber)
        if (this.enableLogs) {
            console.log('listeners:', `${event}-${hash}`)
        }
        if (options?.runOnCreate) {
            const value = this.subscribers?.value && objectPath.get(this.subscribers?.value, event)
            subscriber(value)
        }
        if (options?.debounce) {
            objectPath.set(this.subscribers, `debouncers.${event}.${hash}.delay`, options.debounce)
        }
        return {
            unsubscribe: this.unsubscribe(event, hash),
        }
    }

    public onChange(subscriber: SubscriberGlobal<K>): Unsubscribe {
        const hash = generateHash()

        objectPath.set(this.subscribers, `onChange.${hash}`, subscriber)
        if (this.enableLogs) {
            console.log('onChange:', `${hash}`)
        }

        return {
            unsubscribe: this.unsubscribeOnChange(hash),
        }
    }

    // public subscribeWithValue<A extends string = K>(event: A, subscriber: Subscriber<T, A>): Unsubscribe {
    //     const hash = generateHash()
    //     objectPath.set(this.subscribers, `listeners.${event}.${hash}`, subscriber)
    //     if (this.enableLogs) {
    //         console.log('listeners:', `${event}-${hash}`)
    //     }

    //     const value = this.subscribers?.value && objectPath.get(this.subscribers?.value, event)
    //     subscriber(value)
    //     return {
    //         unsubscribe: this.unsubscribe(event, hash),
    //     }
    // }

    // public subscribes(events: K[], subscriber: SubscriberIdentifier<T, K>): Unsubscribe {
    //     const unsubscribes: Unsubscribe[] = []

    //     events.forEach(event => {
    //         const hash = generateHash()
    //         objectPath.set(this.subscribers, `listeners.${event}.${hash}`, subscriber)
    //         if (this.enableLogs) {
    //             console.log('listeners:', `${event}-${hash}`)
    //         }

    //         unsubscribes.push({
    //             unsubscribe: this.unsubscribe(event as string, hash),
    //         })
    //     })

    //     return {
    //         unsubscribe() {
    //             unsubscribes.forEach(x => x.unsubscribe())
    //         },
    //     }
    // }

    // public subscribesWithValue(
    //     events: K[],
    //     subscriber: SubscriberIdentifier<T, K>,
    // ): Unsubscribe {
    //     const unsubscribes: Unsubscribe[] = []

    //     events.forEach(event => {
    //         const hash = generateHash()
    //         objectPath.set(this.subscribers, `listeners.${event}.${hash}`, subscriber)
    //         if (this.enableLogs) {
    //             console.log('listeners:', `${event}-${hash}`)
    //         }

    //         const value = this.subscribers.value && objectPath.get(this.subscribers.value, event)
    //         subscriber(event, value)

    //         unsubscribes.push({
    //             unsubscribe: this.unsubscribe(event, hash),
    //         })
    //     })

    //     return {
    //         unsubscribe() {
    //             unsubscribes.forEach(x => x.unsubscribe())
    //         },
    //     }
    // }

    public getValue<A extends string = K>(event: A): PathValue<T, A> | undefined {
        return this.subscribers.value && objectPath.get(this.subscribers.value, event)
    }

    public getSubscribers() {
        const { debouncers, ...subscribers } = this.subscribers
        return subscribers
    }

    public register<A extends string = K>(event: A, payload?: PathValue<T, A>) {
        objectPath.set(this.subscribers, `listeners.${event}`, {})
        if (this.storage) {
            objectPath.set(this.subscribers, `value.${event}`, payload)
        }
    }

    public async dispatch<A extends string = K>(event: A, payload?: PathValue<T, A>) {
        const subscriber = this.subscribers.listeners[event]

        if (subscriber) {

            if (this.storage) {
                objectPath.set(this.subscribers, `value.${event}`, payload)
            }



            const keys = Object.keys(subscriber)
            for (let i = 0; i < keys.length; i++) {
                const hash = keys[i];
                const listener = (subscriber as any)[hash]

                const send = () => {
                    try {
                        let result: any
                        if (listener.length === 2) {
                            result = listener(event, payload)
                        } else {
                            result = listener(payload)
                        }

                        if (result instanceof Promise) {
                            result.then().catch(err => {
                                if (this.throwOnFailure) {
                                    throw err
                                } else {
                                    console.log(`dispatch failed to handle event ${event}`, err)
                                }
                            })
                        }
                    } catch (error) {
                        if (this.throwOnFailure) {
                            throw error
                        } else {
                            console.log(`dispatch failed to handle event ${event}`, error)
                        }
                    }
                }
                const delay = objectPath.get(this.subscribers, `debouncers.${event}.${hash}.delay`)

                if (delay) {

                    clearTimeout(objectPath.get(this.subscribers, `debouncers.${event}.${hash}.timeout`))
                    objectPath.set(this.subscribers, `debouncers.${event}.${hash}.timeout`, setTimeout(() => {
                        send()
                    }, delay))

                } else {
                    send()
                }
            }

            this.dispatchOnChange(event, payload)
            
            if (this.enableLogs) {
                console.log(`dispatch (${event}):`, payload)
            }
        }
    }


    public async dispatchOnChange<A extends string = K>(event: A, payload?: PathValue<T, A>) {

        if (this.subscribers.onChange) {

            const keys = Object.keys(this.subscribers.onChange)
            for (let i = 0; i < keys.length; i++) {
                const listener = (this.subscribers.onChange as any)[keys[i]]
                try {
                    const result = listener(event, payload)
                    if (result instanceof Promise) {
                        result.then().catch(err => {
                            console.error(err)
                        })
                    }
                } catch (error) {
                    console.error(error)
                }
            }

        }
    }

    public remove<A extends string = K>(event: A, keepValue?: boolean) {
        try {
            objectPath.del(this.subscribers, `listeners.${event}`)

            if (this.storage && !keepValue) {
                objectPath.del(this.subscribers, `value.${event}`)
            }
        } catch (error) {
            console.error(error)
        }
    }

    public clear() {
        this.subscribers = this.initial
    }



    private unsubscribe(event: string, hash: string) {
        return () => {
            try {
                if (this.subscribers.listeners[event]) {
                    if (this.autoClearEvents && Object.keys(this.subscribers.listeners[event]).length <= 1) {
                        if (this.enableLogs) {
                            console.log('remove:', `${event}-${hash}`)
                        }
                        if (this.storage && this.autoClearValue) {
                            objectPath.del(this.subscribers, `value.${event}`)
                        }
                        delete this.subscribers.listeners[event]
                    } else {
                        objectPath.del(this.subscribers, `listeners.${event}.${hash}`)
                        if (this.enableLogs) {
                            console.log('remove:', `${event}-${hash}`)
                        }
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
    }

    private unsubscribeOnChange(hash: string) {
        return () => {
            try {
                if (this.subscribers.onChange[hash]) {
                    objectPath.del(this.subscribers, `onChange.${hash}`)
                    if (this.enableLogs) {
                        console.log('remove:', `onChange-${hash}`)
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
    }
}
