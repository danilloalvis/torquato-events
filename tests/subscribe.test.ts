import Sinal from '../src';
import { NestedKeyOf } from '../src/type';

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

type User = {
    name: string
    age: number
    address: {
        street: string
        number: string
    }
    tasks: {
        name: string
    }[]
}


test('Teste Subscribe', async () => {

    const UserChange = new Sinal<NestedKeyOf<User>, User>()
    let counter = 0
    const sub = UserChange.subscribe('age', (payload) => {
        counter++
        expect(payload).toBe(30);
    })

    await timeout(100)

    UserChange.dispatch("age", 30)

    await timeout(100)

    let counterDebounce = 0
    const subDebounce = UserChange.subscribe('age', (payload) => {
        counterDebounce++
    },{
        debounce:100
    })

    UserChange.dispatch("age", 30)
    UserChange.dispatch("age", 30)
    UserChange.dispatch("age", 30)

    await timeout(500)

    expect(counter).toBe(4)
    expect(counterDebounce).toBe(1)

    sub.unsubscribe()
    subDebounce.unsubscribe()

    expect(UserChange.getSubscribers().listeners?.age).toBeDefined()

});

test('Teste Subscribe Async', async () => {

    const UserChange = new Sinal<NestedKeyOf<User>, User>()

    const sub = UserChange.subscribe('age', async (payload) => {
        await timeout(100)
        expect(payload).toBe(30);
    })

    await timeout(100)

    UserChange.dispatch("age", 30)

    await timeout(200)

    sub.unsubscribe()

    expect(UserChange.getSubscribers().listeners?.age).toBeDefined()

});

test('Teste Subscribe with Value', async () => {

    const UserChange = new Sinal<NestedKeyOf<User>, User>({ storage: true })
    let firstCheck = true
    const sub1 = UserChange.subscribe('age', (payload) => {
        if (firstCheck) {
            expect(payload).toBe(undefined);
        }
        firstCheck = false
    }, {
        runOnCreate: true
    })

    await timeout(100)

    UserChange.dispatch("age", 30)

    await timeout(100)

    const sub2 = UserChange.subscribe('age', (payload) => {
        expect(payload).toBe(30);
    }, {
        runOnCreate: true
    })

    await timeout(100)

    sub1.unsubscribe()
    sub2.unsubscribe()

    expect(UserChange.getSubscribers().value?.age).toBe(30);
    expect(UserChange.getSubscribers().listeners?.age).toBeDefined()

});
