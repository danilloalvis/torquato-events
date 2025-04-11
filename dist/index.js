"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => Sinal
});
module.exports = __toCommonJS(src_exports);

// src/utils.ts
function generateHash() {
  return `${(/* @__PURE__ */ new Date()).getTime()}b${Math.floor(Math.random() * (999 - 100 + 1) + 100)}`;
}

// src/index.ts
var import_object_path = __toESM(require("object-path"));
var Sinal = class {
  constructor(params) {
    this.initial = {
      value: void 0,
      listeners: {},
      onChange: {},
      debouncers: {}
    };
    this.subscribers = this.initial;
    this.throwOnFailure = !!(params == null ? void 0 : params.throwOnFailure);
    this.storage = !!(params == null ? void 0 : params.storage);
    this.enableLogs = !!(params == null ? void 0 : params.enableLogs);
    this.autoClearValue = !!(params == null ? void 0 : params.autoClearValue);
    this.autoClearEvents = !!(params == null ? void 0 : params.autoClearEvents);
  }
  subscribe(event, subscriber, options) {
    var _a, _b;
    const hash = generateHash();
    import_object_path.default.set(this.subscribers, `listeners.${event}.${hash}`, subscriber);
    if (this.enableLogs) {
      console.log("listeners:", `${event}-${hash}`);
    }
    if (options == null ? void 0 : options.runOnCreate) {
      const value = ((_a = this.subscribers) == null ? void 0 : _a.value) && import_object_path.default.get((_b = this.subscribers) == null ? void 0 : _b.value, event);
      subscriber(value);
    }
    if (options == null ? void 0 : options.debounce) {
      import_object_path.default.set(this.subscribers, `debouncers.${event}.${hash}.delay`, options.debounce);
    }
    return {
      unsubscribe: this.unsubscribe(event, hash)
    };
  }
  onChange(subscriber) {
    const hash = generateHash();
    import_object_path.default.set(this.subscribers, `onChange.${hash}`, subscriber);
    if (this.enableLogs) {
      console.log("onChange:", `${hash}`);
    }
    return {
      unsubscribe: this.unsubscribeOnChange(hash)
    };
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
  getValue(event) {
    return this.subscribers.value && import_object_path.default.get(this.subscribers.value, event);
  }
  getSubscribers() {
    const _a = this.subscribers, { debouncers } = _a, subscribers = __objRest(_a, ["debouncers"]);
    return subscribers;
  }
  register(event, payload) {
    import_object_path.default.set(this.subscribers, `listeners.${event}`, {});
    if (this.storage) {
      import_object_path.default.set(this.subscribers, `value.${event}`, payload);
    }
  }
  dispatch(event, payload) {
    return __async(this, null, function* () {
      const subscriber = this.subscribers.listeners[event];
      if (subscriber) {
        if (this.storage) {
          import_object_path.default.set(this.subscribers, `value.${event}`, payload);
        }
        const keys = Object.keys(subscriber);
        for (let i = 0; i < keys.length; i++) {
          const hash = keys[i];
          const listener = subscriber[hash];
          const send = () => {
            try {
              let result;
              if (listener.length === 2) {
                result = listener(event, payload);
              } else {
                result = listener(payload);
              }
              if (result instanceof Promise) {
                result.then().catch((err) => {
                  if (this.throwOnFailure) {
                    throw err;
                  } else {
                    console.log(`dispatch failed to handle event ${event}`, err);
                  }
                });
              }
            } catch (error) {
              if (this.throwOnFailure) {
                throw error;
              } else {
                console.log(`dispatch failed to handle event ${event}`, error);
              }
            }
          };
          const delay = import_object_path.default.get(this.subscribers, `debouncers.${event}.${hash}.delay`);
          if (delay) {
            clearTimeout(import_object_path.default.get(this.subscribers, `debouncers.${event}.${hash}.timeout`));
            import_object_path.default.set(this.subscribers, `debouncers.${event}.${hash}.timeout`, setTimeout(() => {
              send();
            }, delay));
          } else {
            send();
          }
        }
        this.dispatchOnChange(event, payload);
        if (this.enableLogs) {
          console.log(`dispatch (${event}):`, payload);
        }
      }
    });
  }
  dispatchOnChange(event, payload) {
    return __async(this, null, function* () {
      if (this.subscribers.onChange) {
        const keys = Object.keys(this.subscribers.onChange);
        for (let i = 0; i < keys.length; i++) {
          const listener = this.subscribers.onChange[keys[i]];
          try {
            const result = listener(event, payload);
            if (result instanceof Promise) {
              result.then().catch((err) => {
                console.error(err);
              });
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    });
  }
  remove(event, keepValue) {
    try {
      import_object_path.default.del(this.subscribers, `listeners.${event}`);
      if (this.storage && !keepValue) {
        import_object_path.default.del(this.subscribers, `value.${event}`);
      }
    } catch (error) {
      console.error(error);
    }
  }
  clear() {
    this.subscribers = this.initial;
  }
  unsubscribe(event, hash) {
    return () => {
      try {
        if (this.subscribers.listeners[event]) {
          if (this.autoClearEvents && Object.keys(this.subscribers.listeners[event]).length <= 1) {
            if (this.enableLogs) {
              console.log("remove:", `${event}-${hash}`);
            }
            if (this.storage && this.autoClearValue) {
              import_object_path.default.del(this.subscribers, `value.${event}`);
            }
            delete this.subscribers.listeners[event];
          } else {
            import_object_path.default.del(this.subscribers, `listeners.${event}.${hash}`);
            if (this.enableLogs) {
              console.log("remove:", `${event}-${hash}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
  }
  unsubscribeOnChange(hash) {
    return () => {
      try {
        if (this.subscribers.onChange[hash]) {
          import_object_path.default.del(this.subscribers, `onChange.${hash}`);
          if (this.enableLogs) {
            console.log("remove:", `onChange-${hash}`);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
  }
};
