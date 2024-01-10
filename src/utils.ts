



export const objectUtil = {
    set: (obj: any, path: string, value?: any) => {
        const keys = path.split(".")
        if (keys.length === 1) {
            obj[path] = value
            return
        }
        const [key, ...rest] = keys
        
        if (!obj[key]) {
            obj[key] = {}
        }

        objectUtil.set(obj[key], rest.join("."), value)
    },
    del: (obj: any, path: string) => {
        const keys = path.split(".")
        if (keys.length === 1) {
            delete obj[path]
            return
        }
        const [key, ...rest] = keys
        objectUtil.del(obj[key], rest.join("."))
    },

}

export function generateHash() {
    return `${new Date().getTime()}b${Math.floor(Math.random() * (999 - 100 + 1) + 100)}`
}