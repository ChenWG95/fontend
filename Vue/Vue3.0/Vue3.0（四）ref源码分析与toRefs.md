# Vue3.0（四）ref源码分析与toRefs

我们在之前的章节存在一个尚未解决的问题，为什么reactive包装的对象直接赋值会被覆盖丢失响应式，而ref包装的对象通过value赋值就不会丢失响应式呢？我们接下来将通过ref源码来对这个现象进行分析

## ref源码分析

下面一个ref源码的简化版

````js
function ref(value) {
    return createRef(value);
}

function createRef(rawValue, shallow = false) {
  	// 已经是ref则直接返回
    if (isRef(rawValue)) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}
````

可以看到主要是通过RefImpl创建出ref，我们再来看一下RefImpl

````js
class RefImpl {
    constructor(_rawValue, _shallow = false) {
        // ...
        this._value = _shallow ? _rawValue : convert(_rawValue);
    }
    get value() {
        track(toRaw(this), "get" /* GET */, 'value');
        return this._value;
    }
    set value(newVal) {
        if (hasChanged(toRaw(newVal), this._rawValue)) {
            this._rawValue = newVal;
            this._value = this._shallow ? newVal : convert(newVal);
            trigger(toRaw(this), "set" /* SET */, 'value', newVal);
        }
    }
}
````

这里我省略了一部分代码，但是可以看到**RefImpl相当于为对象创建了一个value的set&get的Proxy**。但是这就有点奇怪了，为什么不直接包装对象，反而使用value属性呢？

此时回想一下ref的设计初衷：**为非对象的基础数据类型创建响应性**。突然明白了，使用value的原因是因为**Proxy代理的是对象，无法直接对基础类型进行代理**，所以Vue3.0通过把他变成一个value的对象来实现对于属性的监听和修改，就像是这样

````js
var count = reactive(1) // 这样无法进行监听，因为Proxy只能接收一个对象
var count = ref(1) // 这样可以进行监听，因为内部会转化为 { value: 1 }，监听value的变化
````

值得一提的是ref也可以传入对象，我们传入对象的时候是会默认转化为reactive

````js
const convert = (val) => isObject(val) ? reactive(val) : val;
````

这也就可以解释为什么我们通过.value进行赋值的对象不会丢失响应性了，**因为其内部会对对应的value进行监听，所以当对ref对象value赋值时会触发value的set逻辑，从而进行响应性更新**



## toRefs

除了ref，还有一个toRefs的API值得我们关注。之前我们在setup的时候有说过无法对prop进行解构也是同样的原因，因为prop本身传过来是一个Proxy，如果直接解构则会破坏对应的响应性。但是如果通过toRefs进行加工，就可以对其进行解构，这是为什么呢？

我们先来看看toRefs的代码

````js
function toRefs(object) {
    if ((process.env.NODE_ENV !== 'production') && !isProxy(object)) {
        console.warn(`toRefs() expects a reactive object but received a plain one.`);
    }
    const ret = isArray(object) ? new Array(object.length) : {};
    for (const key in object) {
        ret[key] = toRef(object, key);
    }
    return ret;
}
````

可以看到toRefs是对object的每个key进行toRef操作（这里注意object要传一个reative对象），所以我们来看看toRef都做了什么

````js
class ObjectRefImpl {
    constructor(_object, _key) {
        this._object = _object;
        this._key = _key;
        this.__v_isRef = true;
    }
    get value() {
        return this._object[this._key];
    }
    set value(newVal) {
        this._object[this._key] = newVal;
    }
}

function toRef(object, key) {
    return isRef(object[key])
        ? object[key]
        : new ObjectRefImpl(object, key);
}
````

总体来说就是会把对象的key值都转化为带.value的ref对象，这样就可以进行解构了，因为解构出来的属性值均为响应性的ref属性，实际操作就像是这样。

````js
setup(prop) {
  const { title } = toRefs(prop)
	console.log(title.value)
}
````

总的来说toRefs是一个很有用的API，大家可以在实际场景下去进行使用实践