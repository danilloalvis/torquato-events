import { generateHash, objectUtil } from "./utils"

type Subscriber<T> = (payload?: Partial<T>) => Promise<void> | void
type SubscriberIdentifier<K, T> = (event: K, payload?: Partial<T>) => Promise<void> | void

type Sub<K, T> = {
    value?: Partial<T>
    listeners: { [key: string]: Subscriber<T> | SubscriberIdentifier<K, T> }
}

type Subscribers<K, T> = {
    [key: string]: Sub<K, T>
}

type Unsubscribe = {
    remove: () => void
}

type Params = { throwOnFailure?: boolean; storage?: boolean; enableLogs?: boolean }


export default class Sinal<K = string, T = any> {
    private Events!: K

    private Payload!: Partial<T>

    private throwOnFailure: boolean

    private storage: boolean

    private enableLogs: boolean

    private subscribers: Subscribers<K, T> = {}

    private remove = (event: string, hash: string) => {
        return () => {
            if (this.subscribers[event as string]) {
                if (Object.keys(this.subscribers[event]?.listeners).length <= 1) {
                    if (this.enableLogs) {
                        console.log('remove:', `${event}-${hash}`)
                    }
                    delete this.subscribers[event]
                } else {
                    try {
                        objectUtil.del(this.subscribers, `${event}.listeners.${hash}`)
                        if (this.enableLogs) {
                            console.log('remove:', `${event}-${hash}`)
                        }
                    } catch (error) { }
                }
            }
        }
    }

    constructor(params?: Params) {
        this.throwOnFailure = !!params?.throwOnFailure
        this.storage = !!params?.storage
        this.enableLogs = !!params?.enableLogs
    }

    public subscribe<A = K, B = T>(event: A, subscriber: Subscriber<B>): Unsubscribe {
        const hash = generateHash()

        objectUtil.set(this.subscribers, `${event}.listeners.${hash}`, subscriber)
        if (this.enableLogs) {
            console.log('listeners:', `${event}-${hash}`)
        }
        return {
            remove: this.remove(event as string, hash),
        }
    }

    public subscribeWithValue<A = K, B = T>(event: A, subscriber: Subscriber<B>): Unsubscribe {
        const hash = generateHash()
        objectUtil.set(this.subscribers, `${event}.listeners.${hash}`, subscriber)
        if (this.enableLogs) {
            console.log('listeners:', `${event}-${hash}`)
        }

        const value = this.subscribers[event as string]?.value as Partial<B> | undefined
        subscriber(value)
        return {
            remove: this.remove(event as string, hash),
        }
    }

    public subscribes<A = K, B = T>(events: A[], subscriber: SubscriberIdentifier<A, B>): Unsubscribe {
        const removes: Unsubscribe[] = []

        events.forEach(event => {
            const hash = generateHash()
            objectUtil.set(this.subscribers, `${event}.listeners.${hash}`, subscriber)
            if (this.enableLogs) {
                console.log('listeners:', `${event}-${hash}`)
            }

            removes.push({
                remove: this.remove(event as string, hash),
            })
        })

        return {
            remove() {
                removes.forEach(x => x.remove())
            },
        }
    }

    public subscribesWithValue<A = K, B = T>(
        events: A[],
        subscriber: SubscriberIdentifier<A, B>,
    ): Unsubscribe {
        const removes: Unsubscribe[] = []

        events.forEach(event => {
            const hash = generateHash()
            objectUtil.set(this.subscribers, `${event}.listeners.${hash}`, subscriber)
            if (this.enableLogs) {
                console.log('listeners:', `${event}-${hash}`)
            }

            const value = this.subscribers[event as string]?.value as Partial<B> | undefined
            subscriber(event, value)

            removes.push({
                remove: this.remove(event as string, hash),
            })
        })

        return {
            remove() {
                removes.forEach(x => x.remove())
            },
        }
    }

    public getValue<A = K>(event: A) {
        const subscriber = this.subscribers[event as string]
        return subscriber?.value
    }

    public getSubscribers() {
        return this.subscribers
    }

    public clear() {
        this.subscribers = {}
    }

    public async dispatch<A = K, B = T>(event: A, payload?: Partial<B>) {
        let subscriber = this.subscribers[event as string] as Sub<A, B>

        if (subscriber.listeners) {
            
            if (this.storage) {
                objectUtil.set(this.subscribers, `${event}.value`, payload)
            }

            const promises: Promise<any>[] = []

            const keys = Object.keys(subscriber.listeners)
            for (let i = 0; i < keys.length; i++) {
                const listener = subscriber.listeners[keys[i]]

                if (subscriber instanceof Promise) {
                    if (listener.length === 2) {
                        promises.push(listener(event as any, payload) as any)
                    } else {
                        promises.push(listener(payload as any) as any)
                    }
                } else if (this.throwOnFailure) {
                    if (listener.length === 2) {
                        listener(event as any, payload) as any
                    } else {
                        listener(payload as any) as any
                    }
                } else {
                    try {
                        if (listener.length === 2) {
                            listener(event as any, payload) as any
                        } else {
                            listener(payload as any) as any
                        }
                    } catch (error) {
                        console.log(`Subscriber failed to handle event ${event}`, error)
                    }
                }
            }
            if (this.throwOnFailure) {
                await Promise.all(promises)
            } else {
                try {
                    await Promise.all(promises)
                } catch (error) { }
            }
            if (this.enableLogs) {
                console.log('dispatch:', `${event}`)
            }
        }
    }

}

