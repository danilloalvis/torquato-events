import Sinal from '../src';
import { NestedKeyOf } from '../src/type';

function timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const user = {
    name: "Danilo",
    age: 18
}

test('Teste Subscribe', async () => {

    const UserChange = new Sinal<NestedKeyOf<typeof user>, typeof user>()

    const sub = UserChange.subscribe('age', (payload) => {
        expect(payload?.age).toBe(30);
    })

    await timeout(100)

    UserChange.dispatch("age", { age: 30 })

    await timeout(100)

    sub.remove()

    expect(UserChange.getSubscribers()["age"]).toBe(undefined);

});

test('Teste Subscribe with Value', async () => {

    const UserChange = new Sinal<NestedKeyOf<typeof user>, typeof user>({ storage: true })
    let firstCheck = true
    const sub1 = UserChange.subscribeWithValue('age', (payload) => {
        if (firstCheck) {
            expect(payload?.age).toBe(undefined);
        }
        firstCheck = false
    })

    await timeout(100)

    UserChange.dispatch("age", { age: 30 })

    await timeout(100)

    const sub2 = UserChange.subscribeWithValue('age', (payload) => {
        expect(payload?.age).toBe(30);
    })

    await timeout(100)

    sub1.remove()
    sub2.remove()

    expect(UserChange.getSubscribers()["age"]).toBe(undefined);

});

test('Teste Subscribes', async () => {

    const UserChange = new Sinal<NestedKeyOf<typeof user>, typeof user>()

    const sub = UserChange.subscribes(['name', 'age'], (event, payload) => {
        if (event === "name") {
            expect(payload?.name).toBe("Torquato");
        }
        if (event === "age") {
            expect(payload?.age).toBe(30);
        }
    })

    await timeout(100)

    UserChange.dispatch("name", { name: "Torquato" })
    UserChange.dispatch("age", { age: 30 })

    await timeout(100)

    sub.remove()

    expect(UserChange.getSubscribers()["age"]).toBe(undefined);
    expect(UserChange.getSubscribers()["name"]).toBe(undefined);

});

test('Teste Subscribes with Value', async () => {

    const UserChange = new Sinal<NestedKeyOf<typeof user>, typeof user>({ storage: true })

    let firstCheck = true
    const sub1 = UserChange.subscribesWithValue(['name', 'age'], (event, payload) => {
        if (firstCheck) {
            if (event === "name") {
                expect(payload?.name).toBe(undefined);
            }
            if (event === "age") {
                expect(payload?.age).toBe(undefined);
            }
        }
        firstCheck = false
    })

    await timeout(100)

    UserChange.dispatch("name", { name: "Torquato" })
    UserChange.dispatch("age", { age: 30 })

    await timeout(100)

    const sub2 = UserChange.subscribesWithValue(['name', 'age'], (event, payload) => {

        if (event === "name") {
            expect(payload?.name).toBe("Torquato");
        }
        if (event === "age") {
            expect(payload?.age).toBe(30);
        }

    })

    await timeout(100)

    sub1.remove()
    sub2.remove()

    expect(UserChange.getSubscribers()["age"]).toBe(undefined);
    expect(UserChange.getSubscribers()["name"]).toBe(undefined);

});

test('Teste getValue', async () => {

    const UserChange = new Sinal<NestedKeyOf<typeof user>, typeof user>({ storage: true })
    const sub = UserChange.subscribes(['name', 'age'], (event, payload) => {
        if (event === "name") {
            expect(payload?.name).toBe("Torquato");
        }
        if (event === "age") {
            expect(payload?.age).toBe(30);
        }
    })

    await timeout(100)

    UserChange.dispatch("age", { age: 30 })

    await timeout(100)

    expect(UserChange.getSubscribers()["age"]?.value?.age).toBe(30);
    expect(UserChange.getValue("age")?.age).toBe(30);

    sub.remove()

    await timeout(100)

    expect(UserChange.getSubscribers()["age"]?.value?.age).toBe(undefined);
    expect(UserChange.getValue("age")?.age).toBe(undefined);
});
