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


test('Teste getValue', async () => {

    const UserChange = new Sinal<NestedKeyOf<User>, User>({ storage: true })
    UserChange.register("age", 30)

    UserChange.onChange((event, payload) => {
        expect(event).toBe("age")
        expect(payload).toBe(30)
    })

    await timeout(100)

    UserChange.dispatch("age", 30)

    await timeout(100)

    expect(UserChange.getSubscribers()?.value?.age).toBe(30);
    expect(UserChange.getValue("age")).toBe(30);

    await timeout(100)

    expect(UserChange.getSubscribers()?.value?.age).toBe(30);
    expect(UserChange.getValue("age")).toBe(30);
});
